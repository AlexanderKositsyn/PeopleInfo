// получаем данные
import { data1, data2 } from './data';
import PeopleInfo from './tableComponent/PeopleInfo';

let table1 = new PeopleInfo(data1, 'people-info');
let table2 = new PeopleInfo(data2, 'newID');
table1.init();
table2.init();
