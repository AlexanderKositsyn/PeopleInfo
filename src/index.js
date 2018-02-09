// получаем данные
import data from "./data";
import PeopleInfo from "./PeopleInfo";

let table = new PeopleInfo(data, "people-info");
table.init();
console.log(table);
