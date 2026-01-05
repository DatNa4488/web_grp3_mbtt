from superset.app import create_app
from superset.extensions import db
from superset.models.core import Database

app = create_app()
app.app_context().push()

print("Auto-configuring Google Sheets connection...")

# Check if exists
existing_db = db.session.query(Database).filter_by(database_name="Google Sheets").first()

if not existing_db:
    new_db = Database(
        database_name="Google Sheets",
        sqlalchemy_uri="gsheets://"
    )
    db.session.add(new_db)
    db.session.commit()
    print("SUCCESS: 'Google Sheets' database connection created!")
else:
    print("INFO: 'Google Sheets' connection already exists.")
