// получаем данные
import data from "./data";

// этот конструктор принимает данные которые необходимо занести в таблицу
// и корневой элемент в который будет рендерится вся таблица
class PeopleInfo {
  constructor(data, element) {
    this.data = data;
    this.rootElement = element;
  }

  //принимает данные и фильтер(которые сортирует, либо скрывает элементы)
  renderItems(data, filter) {}
}
