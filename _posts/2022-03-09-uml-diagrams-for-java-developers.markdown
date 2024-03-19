---
layout: post
title:  "UML Diagrams for Java Developers"
description: "Design essensial UML diagram before starting programming"
author: moises
categories: [ design ]
image: assets/images/umlDiagrams.jpg
comments: false
---

The **U**nified **M**odeling **L**anguage is a graphical notation for modeling systems and conveying User software requirements. All developers must understand this notation before starting programming.

UML is not only pretty pictures. Instead, they communicate the software design decisions to programmers.

## Use case

As entrepreneurs, we usually pay for costly advertisements to promote our products. We can create a little application to make our ads, promote them as printed flyers, and reduce our investments in ads.

Every developer can abstract the main components from a user requirement differently. Having a standard UML notation helps to eliminate ambiguities about the requirements from the beginning. I want to show you how to translate business requirements into technical solutions with this use case.

## User requirement

Given a text message, a URL link, and an image, build a service that automates the composition of flyer design, including the image, text, and the QR code for the link in a PDF file with an A4 format divided into one, two, four or eight parts ready to print.

![formFlyer](/assets/images/formFlyer.jpg "codersite flyer"){:class="img-responsive"}

From the user requirement, we can realize that we need a task to create a QR code, a job to manipulate elements inside an image, and a task to create a PDF file.

<div>
{%- include inArticleAds.html -%}
</div>

We can implement our code or reuse external libraries as dependencies, but the following figure shows the desired result, whatever the implementation approach is chosen.

![codersiteFlyers](/assets/images/codersiteFlyers.jpg "codersite flyers"){:class="img-responsive"}

## Why do we model?

- We build models to understand better the system we are developing.
- Models document the design decisions we have made.
- Models allow an open discussion in the development team before starting programming.
- It speeds up the implementation stage because potential technical issues are discussed during the design stage.

## Visualizing software architecture - design proposal

The [C4 model](https://c4model.com/){:target="_blank"} enables software development teams to describe and communicate software design decisions, similar to Google maps zooming in and out of an area of interest.

These areas of interest in the software are:

**Context -> Containers -> Components -> Code** - UML Notation

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

### Context diagram

A system context diagram shows the big picture. This diagram shows actors and software systems rather than technologies. For our use case, it says that building a new web application will achieve the user requirement.

![flyerContextDiagram](/assets/images/flyerContextDiagram.png "codersite flyer Context Diagram"){:class="img-responsive"}

### Container diagram

The container diagram shows how the responsibilities are distributed in different execution units - containers.

We need a Form on the front end and an API application on the back end for our web application.

![flyerContainerDiagram](/assets/images/flyerContainerDiagram.png "codersite flyer Container Diagram"){:class="img-responsive"}

<div>
{%- include inArticleAds.html -%}
</div>

### Component diagram

As system analysts, we delegate **responsibilities** to software elements called *components* or *services* that execute sub-tasks with specific technologies to achieve the user software requirements. Read the [Single Responsibility Principle](https://codersite.dev/solid-principles-the-definitive-guide/){:target="_blank"}.

The API application interacts with the user requests. Then, delegates the following subtasks to different services.

- Generate a QR Code based on the URL link achieved by the **QR Service**.
- Merge the previous QR Code, text message, and image in a final image design performed by the **Image Service**.
- Build a PDF file that includes the last design image achieved by the **PDF Service**.

The API application returns the final image design in a PDF file to the user.

![flyerComponentDiagram](/assets/images/flyerComponentDiagram.png "codersite flyer Component Diagram"){:class="img-responsive"}

It's better to include a new service called **FlyerComposerService** between the API application and the three services. It facilitates the migration task if you want to adopt a microservices architecture.

<div>
{%- include inArticleAds.html -%}
</div>

The *FlyerComposerService* class is responsible for orchestrating all calls to these three last services.

### UML Class Diagrams

A class is a template for creating objects providing initial values for state (attributes) and behavior (operations). Each attribute has a type. Each operation has a signature.

![adsClassUMLNotation](/assets/images/adsClassUMLNotation.JPG "UML class diagram"){:class="img-responsive"}

From the figure above:

- The first compartment describes the class name.
- The second compartment describes the attributes with its visibility, private(-) or public(+), and their types.
- The third compartment describes the operations and their return types.

The following code snippet shows how these compartments are translated into code.

```kotlin
public class FlyerComposerService {

  private QRService qrService;
  private ImageService imageService;
  private PDFService pdfService;
  
  public byte[] composeFlyer(String[] qrText,
    String text,
    byte[] image,
    int nroFlyers) {
    
    //code omitted for brevity
  }

}
```

<div>
{%- include inArticleAds.html -%}
</div>

### Relationships between classes

UML conveys how a class is related to other classes. Let's see the kind of relationships that matter to our design.

#### Dependency

![umlDependency](/assets/images/umlDependency.JPG "UML dependency relationship"){:class="img-responsive"}

Dependency is a relationship used to show that some class requires or depends on another class or interface. In other words, some class provides (supplier) particular functionalities that others require (client). 

At the **FlyerComposerService** class above, we can see how is declared the dependencies as member variables.

#### Realization

![umlRealization](/assets/images/umlRealization.JPG "UML realization relationship"){:class="img-responsive"}

Realization is a relationship where one class realizes or implements the specification defined in another class (usually an interface).

Defining and creating interfaces is an excellent approach to building software to is extendable. Read the [Open-Closed Principle](https://codersite.dev/open-closed-principle/){:target="_blank"}.

<div>
{%- include inArticleAds.html -%}
</div>

### The implemented code reflects the intent of the UML designer.

Using UML diagrams in Java projects is an excellent tool for effective team communication. The following figure conveys the Class diagram.

![adsClassDiagram](/assets/images/adsClassDiagram.JPG "class diagram"){:class="img-responsive"}

For example, we can see how the QRService interface is implemented into code.

```kotlin
public interface QRService {
  byte[] generateQRCode(String qrText) throws Exception;
}
```

In addition, we can see how the QRServiceImpl class is implemented into code

```kotlin
public class QRServiceImpl implements QRService {
  @Override
  public byte[] generateQRCode(String qrText) throws Exception {
  
  //code omitted for brevity
  }
}
```

### Relationships among Objects

Objects contribute to the behavior of a system by collaborating with one another. An object communicates with another object to use the results of operations provided by that object.

Association, Aggregation, and Composition are terms that represent relationships among objects. They are fundamental concepts of Object Oriented Programming.

### Association

An association draws a solid line connecting two classes. It could be named by a verb (using role names) that reflects the business problem domain we are modeling. The following diagram shows two classes that need to communicate with each other.

![umlAssociation](/assets/images/umlAssociation.jpg "UML association relationship"){:class="img-responsive"}

### Aggregation

Aggregation is a particular association type representing a *has-a* relationship and is displayed as a solid line with an unfilled diamond at the association end.

A child class object can exist without the parent class object. In the following diagram, if you delete the Buyer class (parent), the Supplier class (child) still exists.

![umlAggregation](/assets/images/umlAggregation.jpg "UML aggregation relationship"){:class="img-responsive"}

### Composition

Composition is a particular type of aggregation where parts are destroyed when the whole is destroyed. The relationship is displayed as a solid line with a filled diamond at the association end.

A child class object cannot exist without the parent class object. In the following diagram, if you delete the Order class (parent), the Address class (child) does not exist separate to a Order.

![umlComposition](/assets/images/umlComposition.jpg "UML composition relationship"){:class="img-responsive"}

### Applications of Aggregation/Composition diagrams

We can use aggregation/composition diagrams to design API endpoints. For example, the following figure shows the relationships among different business model objects.

![umlCompositionAggregation](/assets/images/shoppingCar.jpg "aggregation/composition diagrams to design API endpoints"){:class="img-responsive"}

To get orders placed by a specific buyer:

```kotlin
GET /api/v2/buyers/{buyerId}/orders
```

To get all articles included in an assortment that belongs to a specific buyer:

```kotlin
GET /api/v2/buyers/{buyerId}/assortments/{assortmentId}/articles
```

### Conclusions

- UML convey how to build the software without ambiguities, e.g., build first an interface instead of a class.
- Modeling through UML yields an understanding of a system.
- An explicit UML class diagram facilitates communication between developers.
- UML diagrams can be used as a documentation tool for Java development teams.

We will see how to implement every Spring Boot service in the following articles, so follow me!

<div>
{%- include softwareDesign.html -%}
</div>
