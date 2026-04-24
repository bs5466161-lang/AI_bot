import pyodbc

# Connection settings
server = 'localhost' # Adjust if your server is different
database = 'master'
conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};Trusted_Connection=yes;'

try:
    conn = pyodbc.connect(conn_str, autocommit=True)
    cursor = conn.cursor()
    
    # Create the database if it doesn't exist
    cursor.execute("IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ai') CREATE DATABASE ai")
    print("Database 'ai' checked/created.")
    
    # Switch to 'ai' database
    cursor.execute("USE ai")
    
    # Create the chat history table
    cursor.execute("""
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'chat_history')
    CREATE TABLE chat_history (
        id INT IDENTITY(1,1) PRIMARY KEY,
        sessionId NVARCHAR(255),
        role NVARCHAR(50),
        content NVARCHAR(MAX),
        timestamp DATETIME DEFAULT GETDATE()
    )
    """)
    print("Table 'chat_history' checked/created.")
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
