from werkzeug.serving import run_simple

from server import app

if __name__ == '__main__':
    run_simple('0.0.0.0', 80, app, use_reloader=True, use_debugger=True)
