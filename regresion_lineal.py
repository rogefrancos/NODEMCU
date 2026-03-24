import sys
import os
import tkinter as tk
from tkinter import filedialog

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from scipy import stats

def cargar_csv():
    """Abre una ventana para seleccionar el archivo CSV."""
    if len(sys.argv) > 1 and os.path.isfile(sys.argv[1]):
        return sys.argv[1]
    root = tk.Tk()
    root.withdraw()
    root.lift()
    root.attributes('-topmost', True)
    ruta = filedialog.askopenfilename(
        title="Selecciona el CSV del sensor DHT11",
        filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
    )
    root.destroy()
    if not ruta:
        print("No se seleccionó ningún archivo.")
        sys.exit(0)
    return ruta

def preparar_datos_fase(ruta_csv, fase='calentamiento'):
    """Filtra y normaliza los datos por fase horaria."""
    df = pd.read_csv(ruta_csv)
    df['fecha_hora'] = pd.to_datetime(df['fecha_hora'])
    df = df.dropna(subset=['temperatura_c', 'fecha_hora'])
    
    # Extraer la hora exacta como decimal (ej. 14:30 -> 14.5)
    df['hora_reloj'] = df['fecha_hora'].dt.hour + df['fecha_hora'].dt.minute / 60
    
    if fase == 'calentamiento':
        # Filtro: 6:00 AM a 3:00 PM (15:00)
        df_fase = df[(df['hora_reloj'] >= 6) & (df['hora_reloj'] <= 15)].copy()
        # Normalizar: Horas transcurridas desde las 6:00 AM
        df_fase['horas_relativas'] = df_fase['hora_reloj'] - 6
        titulo = "Fase de Calentamiento (06:00 - 15:00)"
    else:
        # Filtro: 3:00 PM (15:00) a 6:00 AM del día siguiente
        df_fase = df[(df['hora_reloj'] > 15) | (df['hora_reloj'] < 6)].copy()
        # Normalizar: Horas desde las 3:00 PM (manejando el salto de medianoche)
        df_fase['horas_relativas'] = df_fase['hora_reloj'].apply(lambda x: x - 15 if x >= 15 else x + 9)
        titulo = "Fase de Enfriamiento (15:00 - 05:59)"
        
    df_fase = df_fase.sort_values(['fecha_hora']).reset_index(drop=True)
    return df_fase, titulo

def entrenar_modelo(df):
    """Entrena el modelo RLS y calcula métricas."""
    X = df[['horas_relativas']].values
    y = df['temperatura_c'].values
    
    # Split 80/20
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
    
    modelo = LinearRegression()
    modelo.fit(X_train, y_train)
    y_pred_test = modelo.predict(X_test)
    
    # Métricas
    r2 = r2_score(y_test, y_pred_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    mae = mean_absolute_error(y_test, y_pred_test)
    
    return modelo, X_train, X_test, y_train, y_test, y_pred_test, r2, rmse, mae

def calcular_ic(X_train, y_train, modelo, x_plot):
    """Calcula el Intervalo de Confianza del 95%."""
    n = len(X_train)
    x_m = X_train.mean()
    Sxx = np.sum((X_train - x_m) ** 2)
    y_hat = modelo.predict(X_train.reshape(-1, 1))
    s_err = np.sqrt(np.sum((y_train - y_hat) ** 2) / (n - 2))
    t_crit = stats.t.ppf(0.975, df=n - 2)
    return t_crit * s_err * np.sqrt(1/n + (x_plot - x_m) ** 2 / Sxx)

def graficar_y_guardar(modelo, X_train, X_test, y_train, y_test, y_pred_test, r2, rmse, mae, titulo_fase):
    """Genera la visualización completa de la fase."""
    plt.style.use('dark_background')
    col_train, col_test, col_line, col_grid = '#ff6b35', '#00c9a7', '#ffffff', '#2a2a2a'
    
    fig = plt.figure(figsize=(12, 8), facecolor='#0d0d0d')
    fig.suptitle(f'Análisis RLS — {titulo_fase}', fontsize=14, color='#e8e8e8', y=0.95)
    
    gs = gridspec.GridSpec(2, 2, hspace=0.3, wspace=0.25)

    # 1. Regresión Principal
    ax1 = fig.add_subplot(gs[0, :])
    ax1.set_facecolor('#141414')
    ax1.scatter(X_train, y_train, color=col_train, alpha=0.2, s=15, label='Entrenamiento')
    ax1.scatter(X_test, y_test, color=col_test, alpha=0.6, s=25, label='Prueba')
    
    x_range = np.linspace(0, X_train.max(), 100)
    y_range = modelo.predict(x_range.reshape(-1, 1))
    ic = calcular_ic(X_train.flatten(), y_train, modelo, x_range)
    
    ax1.plot(x_range, y_range, color=col_line, linewidth=2, label='Modelo RLS')
    ax1.fill_between(x_range, y_range-ic, y_range+ic, color=col_test, alpha=0.1, label='IC 95%')
    ax1.set_ylabel('Temperatura (°C)')
    ax1.legend(fontsize=8)
    ax1.grid(color=col_grid)

    # 2. Precisión (Predicho vs Real)
    ax2 = fig.add_subplot(gs[1, 0])
    ax2.set_facecolor('#141414')
    ax2.scatter(y_test, y_pred_test, color=col_test, alpha=0.5)
    lims = [min(y_test.min(), y_pred_test.min()), max(y_test.max(), y_pred_test.max())]
    ax2.plot(lims, lims, '--w', alpha=0.3)
    ax2.set_title('Precisión: Real vs Predicho', fontsize=10, color='#aaa')

    # 3. Histograma de Errores
    ax3 = fig.add_subplot(gs[1, 1])
    ax3.set_facecolor('#141414')
    ax3.hist(y_test - y_pred_test, bins=15, color=col_train, alpha=0.7)
    ax3.set_title('Distribución del Error', fontsize=10, color='#aaa')

    # Texto de Métricas
    info = (f"R²: {r2:.4f}  |  RMSE: {rmse:.4f}°C  |  MAE: {mae:.4f}°C\n"
            f"Ecuación: T = {modelo.coef_[0]:.3f}(h) + {modelo.intercept_:.2f}")
    fig.text(0.5, 0.02, info, ha='center', color='#888', fontfamily='monospace', fontsize=9)

    # Guardar y Mostrar
    filename = f"resultado_{titulo_fase.split()[2].lower()}.png"
    plt.savefig(filename, dpi=150, bbox_inches='tight')
    print(f"Procesado: {titulo_fase} -> Guardado como {filename}")
    plt.show()

if __name__ == '__main__':
    print("Iniciando análisis de Regresión Lineal...")
    ruta = cargar_csv()
    
    for fase in ['calentamiento', 'enfriamiento']:
        datos, nombre_fase = preparar_datos_fase(ruta, fase)
        
        if not datos.empty:
            res = entrenar_modelo(datos)
            # Desempaquetar resultados y graficar
            graficar_y_guardar(res[0], res[1], res[2], res[3], res[4], res[5], res[6], res[7], res[8], nombre_fase)
        else:
            print(f"No hay suficientes datos para {fase}")
            
    print("\nProceso finalizado con éxito.")