# WeebAlgorithms
__This project contains 6 different optimization algorithms with their visualization.__ <br> <br>

# Optimization algorithms list:
<ul>
  <li> A* path finder
  <li> Genetical algorithm
  <li> Ant colony optimization algorithm (ACO)
  <li> Clustering algorithm (K-means, Means-shift)
  <li> Decigion tree algorithm
  <li> Neural network
</ul>

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

# Description of work with algorithms:
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
