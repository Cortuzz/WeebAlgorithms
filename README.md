# WeebAlgorithms
WeebAlgorithms is a project developed as part of the Web Development course <br>
This project allows you to look at the visualization of the work of popular algorithms <br> <br>

Killer feature of the project (also fully implemented by me) - [implementation of the ant colony algorithm for a "real" ant colony](https://cortuzz.github.io/WeebAlgorithms/src/templates/ants.html)<br>
Also present in the project are:
* [Algorithm A*](https://cortuzz.github.io/WeebAlgorithms/src/templates/path_finder.html) by Cortuzz & Ssslakter
* [A genetic algorithm for solving the traveling salesman problem](https://cortuzz.github.io/WeebAlgorithms/src/templates/genetic.html) by Alyoneek
* [Ant algorithm for solving the traveling salesman problem](https://cortuzz.github.io/WeebAlgorithms/src/templates/ants_basic.html) by Cortuzz
* [Algorithm for clustering points on a plane](https://cortuzz.github.io/WeebAlgorithms/src/templates/clustering.html) by Ssslakter
* [Decision Tree](https://cortuzz.github.io/WeebAlgorithms/src/templates/solution_tree.html) by Alyoneek & Cortuzz
* [Neural network for handwriting detection](https://cortuzz.github.io/WeebAlgorithms/src/templates/neural_network.html) by Ssslakter & Cortuzz

<br><br>

# Project developers:
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

_P.S. The fields are: Surname Name (N), GitHub account (G)._

# Description of algorithms:
### A* path finder
To start the algorithm, you need to set the start and end points.
Also you can add borders or generate it by button with variable filling rate.
![image](https://user-images.githubusercontent.com/52497929/159456869-168e4e3b-121e-409b-b1e9-542ae9a7a4fd.png)

Similarly, you can choose maze generation (with this technology, it is guaranteed that there is a path between any two points):
![image](https://user-images.githubusercontent.com/52497929/159457497-c624667c-6f97-470a-bcf8-4acdb137955c.png)
![image](https://user-images.githubusercontent.com/52497929/159457639-7930da69-04d0-4858-afa0-da9a46926a59.png)

Changing the "heuristic metric" parameter will affect the evaluation of different cells by the algorithm:
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
After finding a path between the points, the algorithm will display the most optimal route and output its path length (or that the route does not exist).

![image](https://user-images.githubusercontent.com/52497929/159459336-98306bce-6f9e-44b8-8e46-5d1d79c5e4fb.png)
![image](https://user-images.githubusercontent.com/52497929/159459395-50c2d4ed-8b83-4c15-92fd-62f5b883b560.png)

*Docs in development*

