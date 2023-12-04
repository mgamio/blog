---
layout: post
title:  "How to apply SOLID principles to Services"
description: "How to apply software design principles to services"
author: moises
categories: [ Web APIs ]
image: assets/images/applyingSolidToServices.jpg
comments: false
---

1. Describe the project to implement and enfasize that in every step we need to take into account the importance of solid design principles and refactoring techniques

2. Include a diagram showing lines that connect API controllers, service layers, backends, and data stores

3. Focus in the implementation of services that support API controllers , Buyers and Orders

4. Describe how to apply SRP, OCP, ISP principles to design the services through interfaces

5. Introduce duplicate code when we translate and build Order objects at the ordersByBuyer and listOrders, both contains duplicated code to build a list of orders from the backend classes

6. Explain the ineficiencie of duplicated code, , identify the responsible service to serve buildOrder, and refactor the code, showing in detail every step

7. Explain the introduction of dependency injection in Buyer class (depends on order), show code in springboot

8. Show the final diagram between Buyer and Order

9. Final conclusions, build a selling argument to promote Book!


Please donate if you find this content valuable.

<form action="https://www.paypal.com/donate" method="post" target="_top">
 <input type="hidden" name="hosted_button_id" value="UF4T364RTPPMJ" />
 <input type="image" src="https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
 <img alt="" border="0" src="https://www.paypal.com/en_DE/i/scr/pixel.gif" width="1" height="1" />
</form>
<br/>

<div>
{%- include javaInterviewAds1.html -%}
</div>