"""
DataFlow API - Flask Backend Architecture
Modular, production-structured data platform backend.
"""

from flask import Flask, jsonify
import os

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dataflow_prod_secret_2026'),
        DATABASE=os.environ.get('DATABASE_URL', 'sqlite:///data/dataflow.db'),
    )

    if test_config is not None:
        app.config.update(test_config)

    @app.route('/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'service': 'DataFlow Flask API',
            'version': '1.0.0'
        })

    # Blueprints can be registered here
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000)
