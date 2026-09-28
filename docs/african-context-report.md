African Logistics Context Report

Problem Statement:


Throughout the African region the supply chain of delivering medical supplies across rural areas pertains to be a disadvantage. The lack infrastructure 
care remains harsh in said environment including situational disadvantages like , limited cellular network in an area ,loadshedding , lack of vaccines
and lack of emergency equipment to aid those in critical care, even bad weather can get in the way. Currently in South Africa most rural roads have potholes which can cause major accidents with vehicles, especially those that are in aid in ambulances.
Poor road infrastructure is a major barrier to rural services in sub-Saharan Africa. Evidence from Tanzania shows that upgrading rural roads significantly improves access to healthcare and economic opportunities (Berg et al., 2025).



The on the ground approach with vehicles like cars , vans etc can not be depended on as they serve more as a liability in the roads as we can see examples of traffic , road accidents or packages being damaged while driving. Alternatives to fix an issue could be to use
solar powered delivery and this can come in handy where operations can happen in locations that lack a sustained power grid. By adding solar microgrids
this helps better and there microgrids can be in areas as mentioned where there is not a dedicated power grid in that area.

Research on drone delivery in Rwanda has shown that it significantly improves vaccine access to remote health facilities compared to ground transport (Griffith et al., 2023).


How EcoDash solves this:
The pilot controller also known as the player functions the solar powered drone in the townships of the country in the day or night, aiding in the delivery supplies of the medical equipment
to the clinics and in doing this it makes avoiding hazardous objects easier as its flown and not on the ground. The emphasis of battery life is expressed as it cannot sustain itself for a  very long time as mentioned there
will be zones to recharge to make it easier


Mathematics and Physics approach:
the done is a dedicated 2d vector that has split x and y velocities with inductions of (`VelocityX` , `VelocityY`). The user then makes an input
to add acceleration throughout the Velocity features. Drag which is the friction is also added frame by frame with a multiplier of 0.94 to simulate actual vehicles
being slowed down after the thrust has been taken away



Crosswind Physics:
There is a dynamic crosswind that happens that imposes on the drone while the drone moves .The trigonometric functions are as follows
X-Component:`Math.cos(wind.angle)`*wind.strength
Y-Component:`Math.sin(wind.angle)`*wind.strength

the wind slows down gradually time by time by using `Math.sin(wind.time)`- which makes real simulated wind
that crosswinds that the user must account for.


Orientation:
The drones angle pointer uses the calculation of `Math.atan2(velocityY , velocityX)` it's the most common way to transform a 2d vector into an angle. This makes the rotation
of the drone to face the direction of travel in real time


Battery Consumption:
The battery drain is correlated to the speed of the drone .The faster the drone the faster the consumption of the battery , and in the game context this is consumed
per frame.The drone goes to the solar microgrid zone to simulate landing in a solar grid charging zone.



Collision detection:
The obstacle makes use of 2 mathematical collision methods;

1.) The circular collision like the wildlife and potholes makes a comparison of the distance between the centres to accumulate the total
sum of their radii by making use of the `Math.sqrt(dx^2 + dy^2)`

2.)AABB collision featuresm the likes of construction , traffic etc this checks if the drones bounding box overlaps the obstacles bounding box on both axes



Day/Night cycles:
the incrementation of the `timeOfDay` value (0 -->1) encompasses a ` daylight ` feature via `Math.sin(timeOfDay * Math.PI * 2)` which makes a
dynamic dawn to noon to night transition. The stars, sky color, building lights etc accommodate to the dynamic weather values



References:
Berg, C., Blankespoor, B., & Selod, H. (2025).Better Roads, Better Off? Evidence on Upgrading Roads in Tanzania. The World Bank Economic Review, 39(1), 104–123. https://doi.org/10.1093/wber/lhae017

Griffith, E. F., Schurer, J. M., Mawindo, B., Kwibuka, R., Turibyarive, T., & Amuguni, J. H. (2023). The Use of Drones to Deliver Rift Valley Fever Vaccines in Rwanda: Perceptions and Recommendations. Vaccines, 11(3), 605. https://doi.org/10.3390/vaccines11030605

