---
layout: post
title:  "UML Diagrams for Java Developers"
description: "Design essensial UML diagram before starting programming"
featured-image: codersiteFlyers.jpg
date:   2022-03-09 00:18:45 +0100
last_modified_at: 2022-04-18 14:18:45 +0100
categories: solid design
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

### Context diagram

A system context diagram shows the big picture. It says that building a new web application will achieve the user requirement.

![flyerContextDiagram](/assets/images/flyerContextDiagram.png "codersite flyer Context Diagram"){:class="img-responsive"}

### Container diagram

The container diagram shows how the responsibilities are distributed in different execution units - containers.

We need a Form on the front end and an API application on the back end for our web application.

![flyerContainerDiagram](/assets/images/flyerContainerDiagram.png "codersite flyer Container Diagram"){:class="img-responsive"}

### Component diagram

As system analysts, we delegate **responsibilities** to software elements called *components* or *services* that execute sub-tasks with specific technologies to achieve the user software requirements. Read the [Single Responsibility Principle](https://codersite.dev/solid-principles-the-definitive-guide/){:target="_blank"}.

The API application interacts with the user requests. Then, delegates the following subtasks to different services.

- Generate a QR Code based on the URL link achieved by the **QR Service**.
- Merge the previous QR Code, text message, and image in a final image design performed by the **Image Service**.
- Build a PDF file that includes the last design image achieved by the **PDF Service**.

The API application returns the final image design in a PDF file to the user.

![flyerComponentDiagram](/assets/images/flyerComponentDiagram.png "codersite flyer Component Diagram"){:class="img-responsive"}

It's better to include a new service called **FlyerComposerService** between the API application and the three services. It facilitates the migration task if you want to adopt a microservices architecture.

The *FlyerComposerService* class is responsible for orchestrating all calls to these three last services.

### UML Class Notation

A class is a template for creating objects providing initial values for state (attributes) and behavior (operations). Each attribute has a type. Each operation has a signature.

![adsClassUMLNotation](/assets/images/adsClassUMLNotation.JPG "UML class diagram"){:class="img-responsive"}

From the figure above:

- The first compartment describes the class name.
- The second compartment describes the attributes with its visibility, private(-) or public(+), and their types.
- The third compartment describes the operations and their return types.

The following section shows how these compartments are translated into code.

{% highlight ruby %}
public class FlyerComposerService {

  private QRService qrService;
  private ImageService imageService;
  private PDFService pdfService;
  
  public byte[] composeFlyer(String[] qrText,
    String text,
    byte[] image,
    int nroFlyers)
    .
    //code omitted
  }

}
{% endhighlight %}


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

### The implemented code reflects the intent of the UML designer.

The following figure conveys the Class diagram.

![adsClassDiagram](/assets/images/adsClassDiagram.JPG "class diagram"){:class="img-responsive"}

For example, we can see how the QRService interface is implemented into code.

{% highlight ruby %}
public interface QRService {
  byte[] generateQRCode(String qrText) throws Exception;
}
{% endhighlight %}

In addition, we can see how the QRServiceImpl class is implemented into code

{% highlight ruby %}
public class QRServiceImpl implements QRService {
  @Override
  public byte[] generateQRCode(String qrText) throws Exception {
  .
  //code omitted
  }
}
{% endhighlight %}  

### Conclusions

- UML convey how to build the software without ambiguities, e.g., build first an interface instead of a class.
- Modeling through UML yields an understanding of a system.
- An explicit UML class diagram facilitates communication between developers.

We will see how to implement every Spring Boot service in the following articles, so follow me!