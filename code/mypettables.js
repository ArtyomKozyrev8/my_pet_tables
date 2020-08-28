class TableColumnSort {
    /* the class is used inside MyFilteredSortedTable class, it is separate class see we need to store this.sort_order
    to perform correct sorting (sort order) of the certain column */
    constructor() {
        this.sort_order = true; // indicates whether ascending or descending order should be implemented
        // sort_order keeps state for method sortMyFilteredSortedTableColumn
    }

    static  _bubbleSortArray(tempBodyRowsArray, sort_order, column_type, index) {
        for (let i = 0; i < tempBodyRowsArray.length; i++) {
            for (let j = 0; j < tempBodyRowsArray.length; j++) {
                let cellI = tempBodyRowsArray[i].getElementsByTagName("td").item(index).innerText;
                let cellJ = tempBodyRowsArray[j].getElementsByTagName("td").item(index).innerText;
                // convert to correct type to make correct column sorting:
                if (column_type === "num") {
                    cellI = Number(cellI);
                    cellJ = Number(cellJ);
                }
                if (sort_order) {
                    if (cellI > cellJ) {
                        let c = tempBodyRowsArray[i];
                        tempBodyRowsArray[i] = tempBodyRowsArray[j];
                        tempBodyRowsArray[j] = c;
                    }
                } else {
                    if (cellI < cellJ) {
                        let c = tempBodyRowsArray[i];
                        tempBodyRowsArray[i] = tempBodyRowsArray[j];
                        tempBodyRowsArray[j] = c;
                    }
                }
            }
        }
        return tempBodyRowsArray
    }

    sortMyFilteredSortedTableColumn(myTable, spinner, index, column_type) {
        // index is the order number of cell in table (myTable) header
        let bodyRows = myTable.children[1].getElementsByTagName("tr");
        let tempBodyRowsArray = Array.prototype.slice.call(bodyRows, 0); // convert collection to Array;

        let order = this.sort_order;

        spinner.style.display = "";
        myTable.children[1].style.display = "none";

        // setTimeout is used in order to hide table body, does not work otherwise
        setTimeout(()=> {
            let data = TableColumnSort._bubbleSortArray(tempBodyRowsArray, order, column_type, index);

            spinner.style.display = "";
            myTable.children[1].style.display = "none";

            for (let i = 0; i < data.length; i++) {myTable.children[1].appendChild(data[i]);}
            spinner.style.display = "none";
            myTable.children[1].style.display = "";
            this.sort_order = !this.sort_order;
        }, 100);

    }
}

class MyFilteredSortedTable {
    constructor(div_id,
                table_headings,
                rows_data,
                column_types,
                clear_div= true, // indicates if we want to clear div when we create table
                table_styles={
                    "searchbox": "", // is input text html element style - css class name
                    "csvbtn": "",  // is button html element style - css class name
                    "table": "", // style for table - css class name
                    "tbody": "", // table body style - css class name
                    "thead": "", // table head style - css class name
                    "spinner": "" // loading spinner style - css class name
                }) {
        MyFilteredSortedTable._checkConstructorInputData(table_headings, rows_data, column_types, table_styles, clear_div);
        this.div_id = div_id; // div id in DOM where we would like to see our table
        this.table_headings = table_headings; // Array of table heading
        this.rows_data = rows_data; // Array of Arrays - table lines data
        this.clear_div = clear_div;
        this.table_styles = table_styles;
        this.searchBox = MyFilteredSortedTable._createSearchBox(this.table_styles);
        this.btnCSV = MyFilteredSortedTable._createDownloadCSVBtn(this.table_styles); // download CSV button
        this.loadSpinner = MyFilteredSortedTable._createSpinner(this.table_styles);
        this.myTable = MyFilteredSortedTable._createTable(this.table_headings, this.rows_data, this.table_styles);
        this.column_types = column_types; // Array of strings, strings could be "str" - string or "num" - number
        // column_types are used to implement correct column sorting mechanism
    }

    static _createSpinner(table_styles) {
        let spinnerDiv = document.createElement("div");
        spinnerDiv.setAttribute("class", table_styles["spinner"]);
        spinnerDiv.style.display = "none";
        return spinnerDiv
    }

    static _exportCSV(table) {
        let bodyCSV = "";

        let tableTheadRow = table.children[0].getElementsByTagName("th");
        let tableTbodyRows = table.children[1].getElementsByTagName("tr");

        let bodyTableArray = [];
        let headTableArray = [];
        for (let element of tableTheadRow) {
            let data = element.innerText.replace(
                /(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ');
            data = data.replace(/"/g, '""');
            data = data.replace(/↑↓/g, "")
            headTableArray.push('"' + data + '"');
        }
        bodyTableArray.push(headTableArray.join(";"));
        for (let row of tableTbodyRows) {
            let temp = [];
            for (let element of row.getElementsByTagName("td")) {
                let data = element.innerText.replace(
                    /(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ');
                data = data.replace(/"/g, '""');
                temp.push('"' + data + '"');}
            bodyTableArray.push(temp.join(";"));
        }
        bodyCSV += bodyTableArray.join("\n");

        const tableHTMLURL = "data:text/csv/charset=UTF-8, " + encodeURIComponent(bodyCSV);
        MyFilteredSortedTable._triggerDownload(tableHTMLURL, "table_utf8_encoding.csv");
    }

    static _triggerDownload(url, filename) {
        // is used to create invisible link to download table
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = filename;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
    }

    static _checkConstructorInputData(table_headings, rows_data, column_types, table_styles, clear_div) {
        if (!Array.isArray(table_headings)) { throw "table_headings should be Array"; };
        if (!Array.isArray(rows_data)) { throw "rows_data should be Array"; };
        if (!Array.isArray(column_types)) { throw "column_types should be Array"; };
        if (!(typeof table_styles  === 'object')) { throw "table_styles should be object type"; }
        if (!(typeof clear_div === 'boolean')) { throw "clear_div should be boolean"; }
        if (rows_data.length) {
            if (!Array.isArray(rows_data[0])) {throw "rows_data should be Array of Arrays"};
            if (((table_headings.length !== rows_data[0].length) | (table_headings.length !== column_types.length))) {
                throw "Length of table_headings, rows_data, column_types should be equal";
            } else {
                if (table_headings.length !== column_types.length) {
                    throw "Length of table_headings, column_types should be equal";
                }
            }
        }
        for (let i=1; i<rows_data.length; i++) {
            if (!Array.isArray(rows_data[i])) {throw "rows_data should be Array of Arrays"};
            if (rows_data[i].length !== rows_data[0].length) {
                throw "All Arrays inside rows_data should have the same length";
            };
        }
        for (let i=0; i<column_types.length; i++) {
            if (column_types[i] === "num") {}
            else if (column_types[i] === "str") {}
            else {throw "column_types should contain only 'num' or 'str' values";}
        }
        if (!(table_styles.hasOwnProperty("searchbox") &
            table_styles.hasOwnProperty("table") &
            table_styles.hasOwnProperty("tbody") &
            table_styles.hasOwnProperty("thead") &
            table_styles.hasOwnProperty("csvbtn") &
            table_styles.hasOwnProperty("spinner")
        )) {
            throw 'table_styles should have the following structure: {' +
            '"searchbox": "class name or empty string",' +
            ' "csvbtn": "", "table": "", "tbody": "", "thead": "", "spinner": ""}';
        }
    }

    static _createSearchBox(table_styles) {
        let _searchBox = document.createElement("input");
        _searchBox.setAttribute("class", table_styles["searchbox"]);
        _searchBox.style.marginBottom = "3px";
        _searchBox.setAttribute("placeholder", "Пожалуйста введите часть слова, которое ищете ...");
        return _searchBox
    }

    static _createDownloadCSVBtn(table_styles) {
        let btn = document.createElement("button");
        btn.innerText = "CSV";
        btn.style.marginBottom = "3px";
        btn.setAttribute("class", table_styles["csvbtn"]);
        return btn
    }

    static _filterTableBody(_tableBody, _searchBox) {
        // hide rows of the table based on value of searchBox
        for (let i=0; i<_tableBody.childElementCount; i++) {
            let found = false;
            for (let j=0; j<_tableBody.children[i].childElementCount; j++) {
                if (_tableBody.children[i].children[j].innerText.toLowerCase().includes(
                    _searchBox.value.toLowerCase())) {
                    found = true;
                    break
                }
            }
            if (!found) {
                _tableBody.children[i].style.display = 'none';
            } else {
                _tableBody.children[i].style.display = '';
            }
        }
    }

    static _createTable(_table_headings, _rows_data, table_styles) {
        let myTable = document.createElement("table");
        myTable.setAttribute("class", table_styles["table"]);

        // create table head block
        let th_row = document.createElement("tr");
        for (let i=0; i<_table_headings.length; i++) {
            let element = document.createElement("th");
            element.innerHTML = _table_headings[i] + " <b><span style='font-size: 22px;'>&#8593;&#8595;</span></b>";
            th_row.appendChild(element);
        }
        let tableHead = document.createElement("thead");
        tableHead.setAttribute("class", table_styles["thead"]);
        tableHead.appendChild(th_row);
        myTable.appendChild(tableHead);

        // create table body block
        let tableBody = document.createElement("tbody");
        tableBody.setAttribute("class", table_styles["tbody"]);

        for (let i=0; i<_rows_data.length; i++) {
            let body_row = document.createElement("tr");
            for (let j=0; j<_rows_data[i].length; j++) {
                let element = document.createElement("td");
                element.innerText = _rows_data[i][j];
                body_row.appendChild(element);
            }
            tableBody.appendChild(body_row);
        }
        myTable.appendChild(tableBody);

        return myTable
    }

    create_filtered_sorted_table() {
        // the methods insert our table in the chosen div container
        let divContainer = document.getElementById(this.div_id);
        if (this.clear_div) {divContainer.innerText = "";};

        let tableHead = this.myTable.children[0];
        let tableBody = this.myTable.children[1];

        this.searchBox.addEventListener("keyup", () => {
            MyFilteredSortedTable._filterTableBody(tableBody, this.searchBox);
        });

        // add event handler to column headers
        for (let index=0; index<tableHead.children[0].childElementCount; index++) {
            let sort = new TableColumnSort();
            tableHead.children[0].children[index].addEventListener("click", ()=>{
                sort.sortMyFilteredSortedTableColumn(this.myTable, this.loadSpinner, index, this.column_types[index]);
            });
        }

        this.btnCSV.addEventListener("click", () => { MyFilteredSortedTable._exportCSV(this.myTable); });

        divContainer.appendChild(this.btnCSV);
        divContainer.appendChild(this.searchBox);
        divContainer.appendChild(this.myTable);
        divContainer.appendChild(this.loadSpinner);
    }
}

class MyFilterSortUpdTable extends MyFilteredSortedTable {
    constructor(
        div_id,
        table_headings,
        rows_data,
        column_types,
        url,
        update_interval,
        clear_div = true, // indicates if we want to clear div when we create table
        table_styles = {
            "searchbox": "", // is input text html element style - css class name
            "csvbtn": "",  // is button html element style - css class name
            "updatesbtn": "", // is button html element style - css class name
            "table": "", // style for table - css class name
            "tbody": "", // table body style - css class name
            "thead": "",  // table head style - css class name
            "spinner": "" // loading spinner style - css class name
        }) {
        MyFilterSortUpdTable._checkConstructorInputDataFilterSortUpd(url, update_interval, table_styles);
        super(div_id, table_headings, rows_data, column_types, clear_div, table_styles);
        this.url = url; // url of http server page to get update for table body
        this.update_interval = update_interval; // how often we would like to update table body
        this.do_updates = true ; // flag whether table should be updated
        this.btnUpd = MyFilterSortUpdTable._createStopResUpdBtn(this.table_styles);
        setInterval(
            () => { MyFilterSortUpdTable._updateTableBody(this.myTable, this.searchBox, this.loadSpinner, this.url) },
            this.update_interval * 1000
        );
    }

    static _createStopResUpdBtn(table_styles) {
        let btn = document.createElement("button");
        btn.innerText = "Не Обновлять";
        btn.style.marginBottom = "3px";
        btn.style.marginLeft = "5px";
        btn.setAttribute("class", table_styles["updatesbtn"]);
        return btn
    }

    static _stopPeriodicUpdates(e) {
        if (typeof this.do_updates === "undefined") { this.do_updates = true }; // otherwise can  cause problem
        if (this.do_updates) {
            this.do_updates = false;
            e.target.innerText = "Обновлять";
        } else {
            this.do_updates = true;
            e.target.innerText = "Не Обновлять";
        }
    }

    static _checkConstructorInputDataFilterSortUpd(url, update_interval, table_styles) {
        if (typeof update_interval !== "number") {throw "update_interval should be number"};
        if (update_interval <= 0) {throw "update_interval should be number"};
        if (typeof url !== "string") {throw "update_interval should be number"};
        if (!(typeof table_styles  === 'object')) { throw "table_styles should be object type" };
        if (!(table_styles.hasOwnProperty("updatesbtn")))
        {
            throw 'table_styles should have the following structure: {' +
            '"searchbox": "class name or empty string",' +
            ' "csvbtn": "", "table": "", "tbody": "", "thead": "", "updatesbtn": ""}';
        }
    }

    static _updateTableBody(table, searchBox, spinner, url) {
        if (typeof this.do_updates === "undefined") { this.do_updates = true}; // otherwise can  cause problem
        if (searchBox.value === "" & this.do_updates) {
            spinner.style.display = "";
            table.children[1].style.display = "none"
            fetch(url, {method: 'GET',})
                .then(response => response.json())
                .then(data => {
                    let tableBody = table.children[1];
                    tableBody.innerHTML = "";
                    for (let i = 0; i < data.length; i++) {
                        let body_row = document.createElement("tr");
                        for (let j = 0; j < data[i].length; j++) {
                            let element = document.createElement("td");
                            element.innerText = data[i][j];
                            body_row.appendChild(element);
                        }
                        tableBody.appendChild(body_row);
                    }
                    spinner.style.display = "none";
                    table.children[1].style.display = "";
                })
                .catch((error) => { console.log(error); })
        } else {};
    }

    create_filtered_sorted_table() {
        // the methods insert our table in the chosen div container
        let divContainer = document.getElementById(this.div_id);
        if (this.clear_div) {divContainer.innerText = "";};

        let tableHead = this.myTable.children[0];
        let tableBody = this.myTable.children[1];

        this.searchBox.addEventListener("keyup", () => {
            MyFilterSortUpdTable._filterTableBody(tableBody, this.searchBox);
        });

        // add event handler to column headers
        for (let index=0; index<tableHead.children[0].childElementCount; index++) {
            let sort = new TableColumnSort();
            tableHead.children[0].children[index].addEventListener("click", ()=>{
                sort.sortMyFilteredSortedTableColumn(this.myTable, this.loadSpinner, index, this.column_types[index]);
            });
        }

        this.btnCSV.addEventListener("click", () => { MyFilterSortUpdTable._exportCSV(this.myTable); });
        this.btnUpd.addEventListener("click", (e) => { MyFilterSortUpdTable._stopPeriodicUpdates(e); });
        divContainer.appendChild(this.btnCSV);
        divContainer.appendChild(this.btnUpd);
        divContainer.appendChild(this.searchBox);
        divContainer.appendChild(this.myTable);
        divContainer.appendChild(this.loadSpinner);
    }
}

class PagedTable extends MyFilteredSortedTable {
    constructor(
        div_id,
        table_headings,
        rows_data,
        column_types,
        clear_div = true, // indicates if we want to clear div when we create table
        table_styles = {
            "searchbox": "", // is input text html element style - css class name
            "csvbtn": "",  // is button html element style - css class name
            "table": "", // style for table - css class name
            "tbody": "", // table body style - css class name
            "thead": "",  // table head style - css class name
            "spinner": "" // loading spinner style - css class name
        }) {
        //MyFilterSortUpdTable._checkConstructorInputDataFilterSortUpd(url, update_interval, table_styles);
        super(div_id, table_headings, rows_data, column_types, clear_div, table_styles);
        //this.numberSelector = PagedTable._createNumberSelector();
        this.tableRows = rows_data;
        if (this.tableRows.length > 0) {
            this.curPage = 1;
        } else {
            this.curPage = 0;
        }
        this.visibleTable = PagedTable._createPagedTableVisible(this.table_headings, this.tableRows, this.table_styles);
        this.pagination = PagedTable._createPaginator(this.table_headings, this.btnCSV, this.myTable, this.div_id, this.tableRows, this.curPage, 10, this.table_styles);
        this.searchBox = PagedTable._createSearchBox(this.table_headings, this.btnCSV, this.myTable, this.div_id, this.tableRows, this.curPage, 10, this.table_styles);
        this.dropItems = PagedTable._createItemNumberBtn(this.table_headings, this.btnCSV, this.myTable, this.div_id, this.tableRows, this.curPage, 10, this.table_styles);
        this.itemNumberBtn = this.dropItems[0]
        this.itemMenu = this.dropItems[1]
    }

    static _createItemNumberBtn(table_headings, btnCSV, table, div_id, rows_data, cur_page, items_page, table_styles) {
        let btn = document.createElement("button");
        btn.setAttribute("class", "btn btn-outline-success dropdown-toggle");
        btn.setAttribute("data-toggle", "dropdown");
        btn.setAttribute("items_per_page", "10");
        btn.innerText = "Элементов на странице";
        btn.style.marginBottom = "3px";
        btn.style.marginLeft = "3px";
        let dropDownMenuContainer = document.createElement("div");
        dropDownMenuContainer.setAttribute("class", "dropdown-menu");
        let values = [5, 10, 15, 20, 25, 30, 50, 75, 100, 125, 150];
        for (let i of values) {
            let _link = document.createElement("a");
            _link.innerText = String(i);
            _link.setAttribute("class", "dropdown-item");
            _link.setAttribute("href", "#" + div_id);
            let tableBody = table.getElementsByTagName("tbody").item(0);
            let tableHead = table.getElementsByTagName("thead").item(0);
            let container = document.getElementById(div_id)
            _link.addEventListener("click", (e) => {
                let searchBox = container.getElementsByTagName("input").item(0);
                let activeTableRows = []
                for (let i=0; i<rows_data.length; i++) {
                    let found = false;
                    for (let j=0; j<rows_data[i].length; j++) {
                        if (String(rows_data[i][j]).toLowerCase().includes(
                            searchBox.value.toLowerCase())) {
                            found = true;
                            break
                        }
                    }
                    if (found) {
                        activeTableRows.push(rows_data[i])
                    }
                }
                let cur_page = 1;
                if (activeTableRows.length === 0) { cur_page = 0 }

                items_page = Number(e.target.innerText);
                btn.setAttribute("items_per_page", e.target.innerText)
                tableBody = PagedTable._fillTableBody(tableBody, activeTableRows, cur_page, items_page);
                tableHead = PagedTable._fillTableHead(tableHead, table_headings);
                let navItem = PagedTable._createPaginator(table_headings, btnCSV, table, div_id, activeTableRows, cur_page, items_page, table_styles);
                // search should be done over all elements so rows_data is used
                let newSearchBox = PagedTable._createSearchBox(table_headings, btnCSV, table, div_id, rows_data, cur_page, items_page, table_styles);
                newSearchBox.value = searchBox.value;
                table.appendChild(tableHead);
                table.appendChild(tableBody);

                container.removeChild(container.lastChild);
                container.removeChild(container.lastChild);
                container.removeChild(container.lastChild);
                container.appendChild(newSearchBox);
                container.appendChild(table);
                container.appendChild(navItem);

                let chooseElementNumberBtn = container.getElementsByTagName("button").item(1);
                chooseElementNumberBtn.innerText = `Элементов: ${e.target.innerText}`
            })
            dropDownMenuContainer.appendChild(_link);
        }
        return [btn, dropDownMenuContainer]
    }

    static _createSearchBox(table_headings, btnCSV, table, div_id, rows_data, cur_page, items_page, table_styles) {
        // hide rows of the table based on value of searchBox
        let _searchBox = document.createElement("input");
        _searchBox.setAttribute("class", table_styles["searchbox"]);
        _searchBox.style.marginBottom = "3px";
        _searchBox.setAttribute("placeholder", "Пожалуйста введите часть слова, которое ищете ...");
        let tableBody = table.getElementsByTagName("tbody").item(0);
        let tableHead = table.getElementsByTagName("thead").item(0);

        _searchBox.addEventListener("keyup", (e) => {
            let activeTableRows = []
            for (let i=0; i<rows_data.length; i++) {
                let found = false;
                for (let j=0; j<rows_data[i].length; j++) {
                    if (String(rows_data[i][j]).toLowerCase().includes(
                        _searchBox.value.toLowerCase())) {
                        found = true;
                        break
                    }
                }
                if (found) {
                    activeTableRows.push(rows_data[i])
                }
            }

            let cur_page = 1;
            if (activeTableRows.length === 0) { cur_page = 0}
            let container = document.getElementById(div_id);
            let items_page = Number(container.getElementsByTagName("button").item(1).getAttribute("items_per_page"));
            tableBody = PagedTable._fillTableBody(tableBody, activeTableRows, cur_page, items_page);
            tableHead = PagedTable._fillTableHead(tableHead, table_headings);

            let navItem = PagedTable._createPaginator(table_headings, btnCSV, table, div_id, activeTableRows, cur_page, items_page, table_styles);
            table.appendChild(tableHead);
            table.appendChild(tableBody);
            container.removeChild(container.lastChild);
            container.removeChild(container.lastChild);
            container.appendChild(table);
            container.appendChild(navItem);
            e.preventDefault();
        })
        return _searchBox
    }

    static _fillTableBody(tableBody, rows_data, cur_page, items_page) {
        tableBody.innerHTML = ""
        const totalPageNumber = Math.ceil(rows_data.length/items_page);
        if (totalPageNumber > 0) {
            let startI = (cur_page - 1) * items_page;
            let stopI = cur_page * items_page;
            let subArray = rows_data.slice(startI, stopI);
            for (let i=0; i<subArray.length; i++) {
                let body_row = document.createElement("tr");
                for (let j=0; j<subArray[i].length; j++) {
                    let element = document.createElement("td");
                    element.innerText = subArray[i][j];
                    body_row.appendChild(element);
                }
                tableBody.appendChild(body_row);
            }
        }
        return tableBody
    }

    static _exportCSV(tableHead, tableRows) {
        let bodyCSV = "";
        let bodyTableArray = [];
        let headTableArray = [];
        for (let element of tableHead) {
            headTableArray.push('"' + element + '"');
        }
        bodyTableArray.push(headTableArray.join(";"));
        for (let row of tableRows) {
            let temp = [];
            for (let element of row) {
                temp.push('"' + element + '"');}
            bodyTableArray.push(temp.join(";"));
        }
        bodyCSV += bodyTableArray.join("\n");

        const tableHTMLURL = "data:text/csv/charset=UTF-8, " + encodeURIComponent(bodyCSV);
        MyFilteredSortedTable._triggerDownload(tableHTMLURL, "table_utf8_encoding.csv");
    }

    static _findVisiblePageNumbers(cur, page_to_show_num, total) {
        if (cur === 0) {
            return []
        }
        let pages_to_show_array = [];
        let left_pages_number = Math.floor((page_to_show_num - 1)/2);
        let right_pages_number = page_to_show_num - left_pages_number - 1;
        if (right_pages_number + cur - total > 0) {
            left_pages_number = left_pages_number + (right_pages_number + cur - total);
        }
        let temp_cur = cur;
        while (temp_cur > 1) {
            if (left_pages_number === 0) {
                break
            }
            left_pages_number -= 1;
            temp_cur -= 1;
            pages_to_show_array.push(temp_cur);
        }
        pages_to_show_array.sort();
        pages_to_show_array.push(cur);
        temp_cur = cur + 1;
        right_pages_number += left_pages_number;
        while (right_pages_number > 0) {
            if (temp_cur > total) {
                break
            }
            pages_to_show_array.push(temp_cur);
            temp_cur += 1;
            right_pages_number -= 1;
        }
        return pages_to_show_array
    }

    static _createPaginator(table_headings, btnCSV, table, div_id, rows_data, cur_page, items_page, table_styles) {
        const totalPageNumber = Math.ceil(rows_data.length/items_page);
        let tableBody = table.getElementsByTagName("tbody").item(0);
        let tableHead = table.getElementsByTagName("thead").item(0);

        let navItem = document.createElement("nav");
        navItem.setAttribute("aria-label", "pagination");
        let uList = document.createElement("ul");
        uList.setAttribute("class", "pagination justify-content-center");

        // crete Previous button in paginator
        let listItemPrev = document.createElement("li");
        let last_link = document.createElement("a");
        last_link.innerText = "Назад";
        last_link.setAttribute("href", "#" + div_id);
        last_link.setAttribute("class", "page-link");

        if (cur_page <= 1) {
            listItemPrev.setAttribute("class", "page-item disabled");
        } else {
            listItemPrev.setAttribute("class", "page-item");
            last_link.addEventListener("click", (e) => {
                tableBody = PagedTable._fillTableBody(tableBody, rows_data, cur_page - 1, items_page);
                tableHead = PagedTable._fillTableHead(tableHead, table_headings);
                let navItem = PagedTable._createPaginator(table_headings, btnCSV, table, div_id, rows_data, cur_page - 1, items_page, table_styles);
                table.appendChild(tableHead);
                table.appendChild(tableBody);
                let container = document.getElementById(div_id)
                container.removeChild(container.lastChild);
                container.removeChild(container.lastChild);
                container.appendChild(table);
                container.appendChild(navItem);
            })
        }
        listItemPrev.appendChild(last_link);
        uList.appendChild(listItemPrev);

        let visPagesNum = PagedTable._findVisiblePageNumbers(cur_page, 11, totalPageNumber);
        for (let p of visPagesNum) {
            let listItem = document.createElement("li");
            if (p === cur_page) {
                listItem.setAttribute("class", "page-item active");
            } else {
                listItem.setAttribute("class", "page-item");
            }
            let _link = document.createElement("a");
            _link.innerText = `${p}`;
            _link.setAttribute("href", "#" + div_id);
            _link.setAttribute("class", "page-link");

            _link.addEventListener("click", (e) => {
                tableBody = PagedTable._fillTableBody(tableBody, rows_data, Number(_link.innerText), items_page);
                tableHead = PagedTable._fillTableHead(tableHead, table_headings);
                let navItem = PagedTable._createPaginator(table_headings, btnCSV, table, div_id, rows_data, Number(_link.innerText), items_page, table_styles);
                table.appendChild(tableHead);
                table.appendChild(tableBody);
                let container = document.getElementById(div_id);
                container.removeChild(container.lastChild);
                container.removeChild(container.lastChild);
                container.appendChild(table);
                container.appendChild(navItem);
            })

            listItem.appendChild(_link);
            uList.appendChild(listItem);
        }

        // create Next Button
        let listItemNext = document.createElement("li");
        let next_link = document.createElement("a");
        next_link.innerText = "Далее";
        next_link.setAttribute("href", "#" + div_id);
        next_link.setAttribute("class", "page-link");

        if (cur_page === totalPageNumber) {
            listItemNext.setAttribute("class", "page-item disabled");
        } else {
            listItemNext.setAttribute("class", "page-item");
            next_link.addEventListener("click", () => {
                tableBody = PagedTable._fillTableBody(tableBody, rows_data, cur_page + 1, items_page);
                tableHead = PagedTable._fillTableHead(tableHead, table_headings);
                let navItem = PagedTable._createPaginator(table_headings, btnCSV, table, div_id, rows_data, cur_page + 1, items_page, table_styles);
                table.appendChild(tableHead);
                table.appendChild(tableBody);
                let container = document.getElementById(div_id);
                container.removeChild(container.lastChild);
                container.removeChild(container.lastChild);
                container.appendChild(table);
                container.appendChild(navItem);
            })
        }

        listItemNext.appendChild(next_link);
        uList.appendChild(listItemNext);

        navItem.appendChild(uList);
        return navItem
    }

    static  _sortArray(_array, column_type, index, sort_order=true) {
        for (let i = 0; i < _array.length; i++) {
            for (let j = 0; j < _array.length; j++) {
                let cellI = _array[i];
                let cellJ = _array[j];
                // convert to correct type to make correct column sorting:
                if (column_type === "num") {
                    cellI = Number(cellI);
                    cellJ = Number(cellJ);
                }
                if (sort_order) {
                    if (cellI > cellJ) {
                        let c = _array[i];
                        _array[i] = _array[j];
                        _array[j] = c;
                    }
                } else {
                    if (cellI < cellJ) {
                        let c = _array[i];
                        _array[i] = _array[j];
                        _array[j] = c;
                    }
                }
            }
        }
        return _array
    }

    static _fillTableHead(tableHead, table_headings) {
        tableHead.innerHTML = ""
        let th_row = document.createElement("tr");
        for (let i=0; i<table_headings.length; i++) {
            let element = document.createElement("th");
            element.innerHTML = table_headings[i] + " <b><span style='font-size: 22px;'>&#8593;&#8595;</span></b>";
            element.addEventListener("click", () => {
                console.log("CCC");
            })
            th_row.appendChild(element);
        }
        tableHead.appendChild(th_row);
        return tableHead
    }

    static _createPagedTableVisible(_table_headings, _rows_data, table_styles) {
        let myTable = document.createElement("table");
        myTable.setAttribute("class", table_styles["table"]);
        let tableHead = document.createElement("thead");
        tableHead = PagedTable._fillTableHead(tableHead, _table_headings);
        tableHead.setAttribute("class", table_styles["thead"]);
        myTable.appendChild(tableHead);

        // create table body block
        let tableBody = document.createElement("tbody");
        tableBody.setAttribute("class", table_styles["tbody"]);
        let cur_page = 0
        if (_rows_data.length>0) {cur_page = 1};
        tableBody = PagedTable._fillTableBody(tableBody, _rows_data, cur_page, 10)
        myTable.appendChild(tableBody);

        return myTable
    }

    create_filtered_sorted_table() {
        // the methods insert our table in the chosen div container
        let divContainer = document.getElementById(this.div_id);
        if (this.clear_div) {divContainer.innerText = "";};
        this.btnCSV.addEventListener("click", () => { PagedTable._exportCSV(this.table_headings, this.tableRows); });
        divContainer.appendChild(this.btnCSV);
        divContainer.appendChild(this.itemNumberBtn);
        divContainer.appendChild(this.itemMenu);
        divContainer.appendChild(this.searchBox);
        divContainer.appendChild(this.visibleTable);
        divContainer.appendChild(this.pagination);
    }
}