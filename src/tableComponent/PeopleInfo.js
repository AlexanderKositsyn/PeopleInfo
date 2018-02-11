import { htmlHeader, htmlTable, htmlPagination } from './htmlTemplates';
import getStyleTable from './cssTemplate';

// Компонент "Таблица Людей"
// При создании экземпляра компонента необходимо передать ему корневой элемент (в который рендерить таблицу) и
// данные(которые необходимо отрендерить в таблице)
// Основная идея:
// 1) У всего компонента есть состояние, которое хранится в экземпляре
// 2) В это состояние входит : значение инпута поиска(search), какой сортировщик выбран в таблице(в заголовке каждого столбца)
// 3) Выше указынные пункты генерируют фильтрованные данные(новый массив), которые потом рендарятся по 10 штук.
// 4) Кнопки пагинации рендерятся в зависимости от количества элементов в уже фильтрованном массиве
// 5) Плюс дополнительные фукнции, которые ,генерируют html, красят в зависимости от состояния элементы, сортируют и фильтруют
// исходный массив

// этот конструктор принимает Данные которые необходимо занести в таблицу
// и Корневой элемент в который будет рендерится вся таблица
export default class PeopleInfo {
  constructor(data, elementId) {
    this.data = data;
    this.rootElement = document.getElementById(elementId);
  }
  // создадим состояние приложения
  // текущий номер пагинации
  currentPagination = 1;
  // текст в инпуте
  currentInputText = '';
  // включенный сортировщик
  currentSortValue = '';
  isForwardSortValue = undefined;
  //шаблоны html
  htmlHeader = htmlHeader;
  htmlTable = htmlTable;
  htmlPagination = htmlPagination;
  //функция для генерция HTML кода для строк таблицы
  // принимает объект и генерирует и его св-в строку таблицы
  tableRowHTMLGenerator(obj) {
    let innerRow = '';
    // фунция генерации ячеек
    function tableCellHTMLGenerator(name, key) {
      return `<td class="people-info__table-cell" data-sort='${key}' >${name}</td>`;
    }
    // генерируем внутренности строки
    for (let key in obj) {
      innerRow += tableCellHTMLGenerator(obj[key], key);
    }
    // вставляем cell в tr
    return `<tr class="people-info__table-row">${innerRow}</tr>`;
  }

  paginationButtonHTMLGenerator(lenght) {
    lenght === 0 ? (lenght = 1) : void 0;
    let sumString = '';
    for (let i = 1; i <= lenght; i++) {
      sumString += `<li class="people-info__pagination-item ${
        i === 1 ? 'active' : ''
      } ">
        <button class="people-info__pagination-button">${i}</button>
      </li>`;
    }
    return sumString;
  }
  // функция принимает:
  // фрагмент куда будет сохранен элемент,
  // переменная в которой строка html
  // тег, какой элемент в корне string
  createElementFromString(fragment, string, tag) {
    let elem;
    switch (tag) {
      case 'TD':
        elem = document.createElement('TR');
        break;
      case 'TR':
        elem = document.createElement('TBODY');
        break;
      default:
        elem = document.createElement('DIV');
    }
    elem.innerHTML = string;
    fragment.appendChild(elem.firstElementChild);
  }

  // функция которая генерит таблицу (рагинацию и заголовки колонок)
  // и вызывает первый раз функцию рендера списка renderItems
  init() {
    //функция для генерция HTML кода для заголовков таблицы
    function tableHeaderHTMLGenerator(name) {
      return `<th class="people-info__table-header" >${name}
        <div class="people-info__previous-next" data-sort='${name}' ></div>
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
        this.fragmentApp.querySelector('tr'),
        tableHeaderHTMLGenerator(Object.keys(this.data[0])[i]),
        'TD',
      );
    }

    // (порядок вызова функций важен)
    //вставим фрагмент в таблицу
    this.rootElement.appendChild(this.fragmentApp);
    // ставим все обработчики
    this.initEventListeners();
    // рендерим список
    this.renderItems();

    // формируем стили относительно корневого элемента
    let styleTable = getStyleTable(`#${this.rootElement.id}`);
    // подлючаем стили
    let styleTag = document.createElement('STYLE');
    let text = document.createTextNode(styleTable);
    styleTag.appendChild(text);
    document.head.appendChild(styleTag);
  }

  //берет данные которые сортирует, либо скрывает элементы
  renderItems() {
    // создадим фрагмент в который будем вставлять элементы
    let fragmentTable = new DocumentFragment();

    // формируем новый массив в зависимости от  инпута search
    let filteredData = this.data.filter(item => {
      //найдем совпадния в объекте
      let strOfValues = '';
      for (let key in item) {
        strOfValues += item[key];
      }
      return strOfValues.indexOf(this.currentInputText) >= 0;
    });

    // если стоит сортировка, то сортируем согласно сортировке по определенной колонке
    // а значит формируем новый массив
    if (this.currentSortValue) {
      let sortFunction = (a, b) => {
        //соханим значения
        let value1 = a[this.currentSortValue],
          value2 = b[this.currentSortValue];
        // если это валюта , то сравниваем другие строки
        if (typeof value1 === 'string')
          if (value1.indexOf('$') >= 0 && value2.indexOf('$') >= 0) {
            value1 = parseFloat(value1.slice(1));
            value2 = parseFloat(value2.slice(1));
          }
        // если это дата , то сравниваем числа с начала Unix
        if (typeof value1 === 'string')
          if (/\d+\//g.test(value1) && /\d+\//g.test(value2)) {
            value1 = new Date(value1).getTime();
            value2 = new Date(value2).getTime();
          }
        // ядро сравнения
        if (value1 > value2) {
          return 1;
        }
        if (value1 < value2) {
          return -1;
        }
        return 0;
      };
      // сортируем по значению из состояния приложения
      filteredData.sort(sortFunction);

      // если выключен флаг forward sort то , делаем обратную сортировку
      !this.isForwardSortValue ? filteredData.reverse() : void 0;
    }

    // из нового, фильтрованного массива
    // генерируем строки и сразу вствляем в фрагмент табицы
    //  т е заполняем фрагмет
    // генерация строк происходит для текущей пагинации в зависимоти от currentPagination
    filteredData.map((item, index, array) => {
      if (
        index >= this.currentPagination * 10 - 10 &&
        index <= this.currentPagination * 10 - 1
      )
        this.createElementFromString(
          fragmentTable,
          this.tableRowHTMLGenerator(array[index]),
          'TR',
        );
    });

    // отчищаем таблицу от старых данных
    //сохраняя при этом заголовочную строку таблицы
    let removedCollection = this.rootElement.querySelectorAll(
      'tr:not(:first-child)',
    );
    for (let i = removedCollection.length; i--; ) {
      removedCollection[i].remove();
    }

    //вставляем фрагмент в таблицу
    this.rootElement.querySelector('tbody').appendChild(fragmentTable);

    // в зависимости от кол-ва элементов генерируем необходимые пагинационные кнопки
    // если 0 то ставим хотя бы одну пагинацию
    this.amoutPagination = parseInt(filteredData.length / 10);
    !this.amoutPagination ? (this.amoutPagination = 1) : void 0;
    //вставляем сгенерированные элементы в пагинацию
    this.rootElement.querySelector(
      '.people-info__pagination-list',
    ).innerHTML = this.paginationButtonHTMLGenerator(this.amoutPagination);
    // ставим active  для кнопки пагинации в зависимоти от текущей пагинации
    let paginationButtons = this.paginationListButtons.children;
    for (let i = 0; i < paginationButtons.length; ++i) {
      paginationButtons[i].classList.remove('active');
    }
    this.paginationListButtons.children[
      this.currentPagination - 1
    ].classList.add('active');

    // раскрасим таблицу в зависимости от выбанной сортировки
    let column = this.rootElement.querySelectorAll(
      `[data-sort='${this.currentSortValue}']`,
    );
    for (let i = 1; i < column.length; ++i) {
      i % 2
        ? (column[i].style.backgroundColor = '#F0E0E0')
        : (column[i].style.backgroundColor = '#F0F0F0');
    }
    // заменим на активный класс кнопку сортировки(это в заголвке таблицы)
    let headerRow = this.rootElement.querySelectorAll(
      '.people-info__previous-next',
    );
    if (this.isForwardSortValue === true) {
      for (let i = 0; i < headerRow.length; ++i) {
        headerRow[i].classList.remove('forward');
        headerRow[i].classList.remove('reverse');
      }
      if (column.length) column[0].classList.add('forward');
    } else {
      for (let i = 0; i < headerRow.length; ++i) {
        headerRow[i].classList.remove('forward');
        headerRow[i].classList.remove('reverse');
      }
      if (column.length) column[0].classList.add('reverse');
    }
  }

  // Метод объявления обработчиков на приложении.
  // Обработчики изменяют состояние приложения.
  // И вызывают ререндер приложения.
  initEventListeners() {
    // найдем необходымые элементы относительно корня
    this.paginationListButtons = this.rootElement.querySelector(
      '.people-info__pagination-list',
    );
    let paginationListPrevious = this.rootElement.querySelector(
      '.people-info__previous',
    );
    let paginationListNext = this.rootElement.querySelector(
      '.people-info__next',
    );
    let inputSearch = this.rootElement.querySelector(
      '.people-info__search-input',
    );
    let tableHeader = this.rootElement.querySelector('TBODY').firstElementChild;
    //обработчик на кнопки пагинации
    this.paginationListButtons.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON') {
        this.currentPagination = parseInt(e.target.textContent);
      }
      this.renderItems();
    });
    // обработчик на кпопку next в пагинации
    paginationListNext.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON') {
        this.currentPagination !== this.amoutPagination
          ? (this.currentPagination += 1)
          : void 0;
      }

      this.renderItems();
    });
    // обработчик на кпопку previous в пагинации
    paginationListPrevious.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON') {
        this.currentPagination !== 1 ? (this.currentPagination -= 1) : void 0;
      }
      this.renderItems();
    });
    // обработчик для инпута search
    inputSearch.addEventListener('input', e => {
      // изменяем состояние приложения
      this.currentInputText = e.target.value;
      this.currentPagination = 1;
      //вызываем ререндер
      this.renderItems();
    });
    tableHeader.addEventListener('click', e => {
      if (e.target.tagName === 'DIV') {
        // сравниваем новое значение и старое значение
        if (
          this.currentSortValue === e.target.dataset.sort ||
          !this.currentSortValue
        ) {
          this.isForwardSortValue = !this.isForwardSortValue;
        } else {
          this.isForwardSortValue = true;
        }
        this.currentSortValue = e.target.dataset.sort;

        //вызываем ререндер
        this.renderItems();
      }
    });
  }
}
