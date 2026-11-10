# Configuración de MySQL con XAMPP

El proyecto usa MySQL por defecto. Los valores predeterminados corresponden a
la configuración local habitual de XAMPP: servidor en `127.0.0.1:3306`, usuario
`root`, contraseña vacía y base de datos `age_db`.

El proyecto fija Django 4.2 para ser compatible con MariaDB 10.4, que viene en
algunas versiones de XAMPP. Django 4.2 requiere Python 3.8–3.12; usa Python 3.12
para este proyecto. Esta rama de Django ya no recibe actualizaciones de seguridad,
así que esta configuración es adecuada para desarrollo local, no para publicar
la aplicación en Internet.

1. Inicia el servicio **MySQL** (o **MariaDB**, según la versión) desde el
   panel de control de XAMPP.
2. Abre `http://localhost/phpmyadmin`, crea la base de datos `age_db` y usa la
   intercalación `utf8mb4_unicode_ci`. Si ya creaste la base, no hace falta
   volver a crearla.
3. Instala Python 3.12 si no está instalado. Luego, en una terminal PowerShell
   desde la carpeta del proyecto, crea un entorno virtual, instala las
   dependencias y aplica las migraciones:

   ```powershell
   py -3.12 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

Si tu configuración de XAMPP usa otros datos, configura estas variables antes
de ejecutar Django:

```powershell
$env:DB_NAME = "age_db"
$env:DB_USER = "root"
$env:DB_PASSWORD = "tu_contraseña"
$env:DB_HOST = "127.0.0.1"
$env:DB_PORT = "3306"
```

No guardes contraseñas reales en el código ni las subas al repositorio. Aplicar
las migraciones crea las tablas en MySQL, pero no copia automáticamente los
registros que ya existan en `db.sqlite3`.

El perfil de empresa se guarda desde **Configuración → Perfil de la empresa**.
Las facturas y sus artículos se guardan en MySQL; la pantalla de nueva factura
permite cotizar primero y solo registra la factura al confirmarla.
