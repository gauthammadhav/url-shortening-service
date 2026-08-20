import logging
import sys

# Create a centralized logger for the application
logger = logging.getLogger("url_shortener")

# Set the desired log level
logger.setLevel(logging.INFO)

# Prevent adding multiple handlers if this module is imported in multiple places
if not logger.handlers:
    # Output logs to the console/terminal
    handler = logging.StreamHandler(sys.stdout)

    # Define a readable format: Timestamp - Logger Name - Log Level - Message
    formatter = logging.Formatter(
        fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler.setFormatter(formatter)
    logger.addHandler(handler)

    # Prevent the logger from propagating messages to the root logger (avoids duplicates)
    logger.propagate = False
