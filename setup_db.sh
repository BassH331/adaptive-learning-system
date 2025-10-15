#!/bin/bash

DB_USER="root"
DB_PASSWORD="password" # Replace with your MariaDB root password if different
DB_NAME="adaptive_learning_db"

echo "Creating database and tables..."
mysql -u$DB_USER -p$DB_PASSWORD < schema.sql

if [ $? -eq 0 ]; then
    echo "Database and tables created successfully."
else
    echo "Error creating database or tables. Please check MariaDB status and credentials."
    exit 1
fi

echo "Populating with sample data..."
mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME < sample_data.sql

if [ $? -eq 0 ]; then
    echo "Sample data populated successfully."
else
    echo "Error populating sample data."
    exit 1
fi

echo "Database setup complete."

