# WeebAlgorithms
WeebAlgorithms - проект, разработанный в рамках курса "Веб разработка" <br>
Данный проект позволяет посмотреть на визуализацию работы популярных алгоритмов <br> <br>

Киллер-фича проекта (по совместительсву полностью моя работа) - [реализация алгоритма муравьиной колонии для "реальной" муравьиной колонии](https://cortuzz.github.io/WeebAlgorithms/src/templates/ants.html) (Перейти в "Бонусный вариант")<br>
Также в проекте присутствует:
* [Алгоритм А*](https://cortuzz.github.io/WeebAlgorithms/src/templates/path_finder.html) by Cortuzz & Ssslakter
* [Генетический алгоритм для решения задачи коммивояжера](https://cortuzz.github.io/WeebAlgorithms/src/templates/genetic.html) by Alyoneek
* [Муравьиный алгоритм](https://cortuzz.github.io/WeebAlgorithms/src/templates/ants_basic.html) by Cortuzz
* [Алгоритм кластеризации точек на плоскости](https://cortuzz.github.io/WeebAlgorithms/src/templates/clustering.html) by Ssslakter
* [Дерево решений](https://cortuzz.github.io/WeebAlgorithms/src/templates/solution_tree.html) by Alyoneek & Cortuzz
* [Нейронная сеть, для определения рукописного ввода](https://cortuzz.github.io/WeebAlgorithms/src/templates/neural_network.html) by Ssslakter & Cortuzz

<br><br>

# Разработчики проекта:
<ul>
  <li>N: Batrakov Oleg
  <li>G: Cortuzz
</ul>
<ul>
  <li>N: Chaunin Vyacheslav
  <li>G: Ssslakter
</ul>
<ul>
  <li>N: Tarasova Alyona
  <li>G: alyoneek
</ul>

_P.S. Поля: Фамилия Имя (N), GitHub логин (G)._

# Описание работы алгоритмов
### A*
Чтобы запустить алгоритм, вам необходимо задать начальную и конечную точки <br>
Также вы можете добавить границы или сгенерировать их и использовать разную скорость заполнения (для того, чтоб лучше рассмотреть)

![image](https://user-images.githubusercontent.com/52497929/159456869-168e4e3b-121e-409b-b1e9-542ae9a7a4fd.png)

Аналогично, вы можете выбрать генерацию лабиринта (с помощью этой технологии гарантируется, что между любыми двумя точками существует путь):

![image](https://user-images.githubusercontent.com/52497929/159457497-c624667c-6f97-470a-bcf8-4acdb137955c.png)
![image](https://user-images.githubusercontent.com/52497929/159457639-7930da69-04d0-4858-afa0-da9a46926a59.png)


Изменение параметра "эвристическая метрика" повлияет на оценку различных ячеек алгоритмом:

![image](https://user-images.githubusercontent.com/52497929/159458655-79b6198a-7717-4cfe-a7c2-8372896f8eca.png)
![image](https://user-images.githubusercontent.com/52497929/159458183-f2ffa105-9f3a-4c79-bcf3-8276fedd70df.png)
![image](https://user-images.githubusercontent.com/52497929/159458228-5a2b9501-f096-49c1-a479-d68b2b1c356c.png)

```js
function euclidHeuristic(pointA, pointB) {
    return 2 * Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2);
}

function manhattanHeuristic(pointA, pointB) {
    return Math.abs((pointA.x - pointB.x)) + Math.abs((pointA.y - pointB.y));
}
```

После нахождения пути между точками алгоритм отобразит наиболее оптимальный маршрут и выдаст его длину (или то, что маршрут не существует)

![image](https://user-images.githubusercontent.com/52497929/159459336-98306bce-6f9e-44b8-8e46-5d1d79c5e4fb.png)
![image](https://user-images.githubusercontent.com/52497929/159459395-50c2d4ed-8b83-4c15-92fd-62f5b883b560.png)

*Docs in development*

