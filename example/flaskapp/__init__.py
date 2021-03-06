from flask import Flask, jsonify, render_template
from random import randint


def create_app():
    app = Flask(__name__)

    @app.route("/", methods=["GET"])
    def main():
        """Provide base template for the website"""
        return render_template("main.html")

    @app.route("/random/<int:rows>/<int:items>", methods=["GET"])
    def generate_random_array(rows=0, items=0):
        """
        Provide data for tables
        :param rows: number of rows in the table
        :param items: number of columns in the table
        :return: list of lists
        """
        return jsonify([[randint(0, 200) for j in range(items)] for i in range(rows)])

    @app.route("/paged/<int:rows>/<int:items>", methods=["GET"])
    def generate_array_for_paginated_table(rows=0, items=0):
        """
        Provide data for tables
        :param rows: number of rows in the table
        :param items: number of columns in the table
        :return: list of lists
        """
        table_rows = []
        for i in range(rows):
            row_items = []
            if i // 4 == 0:
                row_items = [999] * items
            elif i // 7 == 0:
                row_items = [1998] * items
            else:
                for j in range(items):
                    row_items.append(j + i)
            table_rows.append(row_items)
        return jsonify(table_rows)

    @app.route("/paged_upd/<int:rows>/<int:items>", methods=["GET"])
    def generate_array_for_paginated_table_upd(rows=0, items=0):
        """
        Provide data for tables
        :param rows: number of rows in the table
        :param items: number of columns in the table
        :return: list of lists
        """
        table_rows = []
        for i in range(rows):
            row_items = []
            if i // 4 == 0:
                row_items = [999] * items
            elif i // 7 == 0:
                row_items = [1998] * items
            else:
                for j in range(items):
                    if j == 0:
                        row_items.append(j + i)
                    else:
                        row_items.append(randint(0, 200))
            table_rows.append(row_items)
        return jsonify(table_rows)

    return app
