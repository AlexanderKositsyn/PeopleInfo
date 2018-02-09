// этот конструктор принимает данные которые необходимо занести в таблицу
// и корневой элемент в который будет рендерится вся таблица
export default class PeopleInfo {
  constructor(data, elementId) {
    this.data = data;
    this.rootElement = document.getElementById(elementId);
  }
  htmlHeader = `<div class="people-info__search">
    <label for="" class="people-info__search-label">
      Search
      <input type="text" class="people-info__search-input">
    </label>
    <button class="people-info__search-button">search</button>
  
    </div>`;
  htmlTable = `<table class="people-info__table">
    <tr class="people-info__table-row people-info__table-row--header">
      
    </tr>
  
    
    </table>`;

  htmlPagination = `<div class="people-info__pagination">
    <button class="people-info__previous">Previous</button>
    <ul class="people-info__pagination-list">
      <li class="people-info__pagination-item active">
        <button class="people-info__pagination-button">1</button>
      </li>
      <li class="people-info__pagination-item">
        <button class="people-info__pagination-button">2</button>
      </li>
    </ul>
    <button class="people-info__next">Next</button>
  
    </div>`;

  //функция для генерция HTML кода для строк таблицы
  // принимает объект и генерирует и его св-в строку таблицы
  tableRowHTMLGenerator(obj) {
    let innerRow = "";
    // фунция генерации ячеек
    function tableCellHTMLGenerator(name) {
      return `<td class="people-info__table-cell">${name}</td>`;
    }
    // генерируем внутренности строки
    for (let key in obj) {
      innerRow += tableCellHTMLGenerator(obj[key]);
    }
    // вставляем cell в tr
    return `<tr class="people-info__table-row">${innerRow}</tr>`;
  }

  // фрагмент куда будет сохранен элемент,
  // переменная в которой строка html
  // тег, какой элемент в корне string
  createElementFromString(fragment, string, tag) {
    let elem;
    switch (tag) {
      case "TD":
        elem = document.createElement("TR");
        break;
      case "TR":
        elem = document.createElement("TBODY");
        break;
      default:
        elem = document.createElement("DIV");
    }
    elem.innerHTML = string;
    console.log(elem.innerHTML);
    fragment.appendChild(elem.firstElementChild);
  }

  // функция которая генерит таблицу (рагинацию и заголовки колонок)
  init() {
    //функция для генерция HTML кода для заголовков таблицы
    function tableHeaderHTMLGenerator(name) {
      return `<th class="people-info__table-header">${name}
        <div class="people-info__previous-next"></div>
      </th>`;
    }

    // создадим фрагмент , в который запишем всю таблицу
    this.fragmentApp = new DocumentFragment();

    //создаем элементы
    this.createElementFromString(this.fragmentApp, this.htmlHeader);
    this.createElementFromString(this.fragmentApp, this.htmlTable);
    this.createElementFromString(this.fragmentApp, this.htmlPagination);

    // исходя из data создадим ячейки заголовков колонок
    for (let i = 0; i < Object.keys(this.data[0]).length; i++) {
      //запишем в фрагмент (именно в таблицу) заголовки
      this.createElementFromString(
        this.fragmentApp.querySelector("tr"),
        tableHeaderHTMLGenerator(Object.keys(this.data[0])[i]),
        "TD"
      );
    }

    //вставим фрагмент в таблицу
    this.rootElement.appendChild(this.fragmentApp);

    this.renderItems();
  }

  //берет данные из объекта и принимает фильтр(которые сортирует, либо скрывает элементы)
  // по умолчанию фильтр для всех элементов выводит true(т е все проходят)
  renderItems(
    filter = () => {
      return true;
    }
  ) {
    // создадим фрагмент в который будем вставлять элементы
    let fragmentTable = new DocumentFragment();

    // формируем новый массив в зависимости от фильтра
    let filteredData = this.data.map(item => {
      if (filter(item)) return item;
    });

    // генерируем строки и сразу вствляем в фрагмент табицы
    //  т е заполняем фрагмет
    filteredData.map(item => {
      this.createElementFromString(
        fragmentTable,
        this.tableRowHTMLGenerator(item),
        "TR"
      );
    });
    //вставляем фрагмент в таблицу
    this.rootElement.querySelector("tbody").appendChild(fragmentTable);
  }
}
