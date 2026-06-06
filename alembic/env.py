# ============================================
# SalesFlow CRM - Alembic Environment Config
# ============================================
# This file is the entry point for Alembic migrations.
# It connects Alembic to our database and models.

from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# Import our database Base and settings
from core.config import settings
from connection.database import Base

# Import ALL models here so Alembic can detect them
# Even if we don't use the imports directly, Alembic needs
# to know about these models to generate migrations.
from models.user import User              # noqa: F401
from models.lead import Lead              # noqa: F401
from models.opportunity import Opportunity  # noqa: F401

# Alembic Config object (reads from alembic.ini)
config = context.config

# Set the database URL from our settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Setup logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Tell Alembic about our models' metadata
# This is how Alembic knows what tables should exist
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.
    
    This generates SQL scripts without connecting to the database.
    Useful for review before applying changes.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.
    
    This connects to the database and applies changes directly.
    This is the normal way to run migrations.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


# Determine which mode to run in
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
