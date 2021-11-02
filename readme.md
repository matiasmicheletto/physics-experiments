# Javascript 3D Mechanics Experiments

This is a small compendium of javascript 3D animations that allows the user to perform mechanics experiments with bodies and systems. 

[]()

In the [/doc](/doc) folder you can find the mathematical model for each system.

[]()

This equations are solved using simple numerical methods as Euler or RK4 integrators. For each simulation, there is a ```dynamic()``` class that contains the mechanical model.

```js
// Spring-mass system model - iteration step
this.step = function(){    
    // Update acceleration
    this.a = -this.k / this.m * this.x; 
    if( this.b ) // If there is friction
        this.a -= this.b / this.m * this.v;
    if( this.F ) // If there is an external oscilation force
        this.a += this.F / this.m * Math.cos(this.w * this.t); 
    // Update velocity
    this.v += this.a * this.dt; 
    // Update position
    this.x += this.v * this.dt; 
    // Update time
    this.t += this.dt; 
}
```

The experiment library is available online on [this site](https://physics-experiments.herokuapp.com).

This is a small part of a bigger project that was developed in the context of an internship carried out in the Department of Electrical Engineering and Computers, at National University of the South.
