---
layout: post
title:  "Tree data structure: Binary Search Tree"
date:   2020-05-12 14:18:45 +0100
categories: datastructure
---
Tree data structure are non-linear data structures, they allow us to implement algorithms much faster than when using linear data structures.

A binary tree can have at the most two children: a left node and a right node. Every node contains data with a key used to identify the data stored by the node and a value that is the data contained in the node.

Moreover, you can search a tree data structure quickly, as you can an ordered array, and you can also insert and delete items quickly, as you can with a linked list.

The following figure shows the binary tree terminology:

![binaryTree](/assets/images/binaryTree.jpg){:class="img-responsive"}

### Tree data structure: Use Case:

The Global Trade Item Number (GTIN) can be used by a company to uniquely identify all of its trade items.

The GTIN can be used to identify types of products that are produced by different manufacturers.

A Webshop wants to retrieve information about GTINs efficiently by using a binary search algorithm.

**Solution**:

We create a Product Class.

{% highlight ruby %}
public class Product {

  Integer productId;
  String name;
  Double price;
  String manufacturerName;
  ... 
{% endhighlight %}

To store a list of Products, then, we create a NodeP Class.

{% highlight ruby %}
public class NodeP {

  private String gtin;
  private List<Product> data;
  private NodeP left;
  private NodeP right;

  public NodeP(String gtin, List<Product> data) {
    this.gtin = gtin;
    this.data = data;
  }
}
{% endhighlight %}

We create a new abstract data type called TreeP to define the behavior of our Binary Search Tree.

Define an *insert* method with two main characteristics:

- The value of the left node must be lesser than the value of its parent.
- The value of the right node must be greater than or equal to the value of its parent.

A Test case to verify our assumptions:

{% highlight ruby %}
@Test
public void when_rootNull_inserNode() {
  tree.insert("04007801321224", new ArrayList<>(Arrays.asList(product1)));
  assertTrue(tree.getRoot() != null);
}
{% endhighlight %}

And here the implementation for the insert method:

{% highlight ruby %}
public class TreeP {

  private NodeP root;

  public void insert(String gtin, List<Product> data) {

    NodeP newNode = new NodeP(gtin, data);

    if (root == null)
      root = newNode;
    else {
      NodeP current = root;
      NodeP parent;
      while (true) {
        parent = current;
        if (gtin.compareTo(current.getGtin()) < 0) {
          current = current.getLeft();
          if (current == null) {
            parent.setLeft(newNode);
            return;
          }
        } else if (gtin.compareTo(current.getGtin()) > 0) {
          current = current.getRight();
          if (current == null) {
            parent.setRight(newNode);
            return;
          }
        } else
          return; //already exists
      }
    }
    return;
  }
}
{% endhighlight %}

Create a Test case for a find method:

{% highlight ruby %}
@Test
public void test_findNode() {
  tree.insert("04000345706564",
    new ArrayList<>(Arrays.asList(product1)));
  tree.insert("07611400983416", 
    new ArrayList<>(Arrays.asList(product2)));
  tree.insert("07611400989104", 
    new ArrayList<>(Arrays.asList(product3, product4)));
  tree.insert("07611400989111",
    new ArrayList<>(Arrays.asList(product5)));
  tree.insert("07611400990292",
    new ArrayList<>(Arrays.asList(product6, product7, product8)));
  assertEquals(null, tree.find("07611400983324"));
  tree.insert("07611400983324",
    new ArrayList<>(Arrays.asList(product9)));
  assertTrue(tree.find("07611400983324") != null);
  assertEquals("07611400983324", 
    tree.find("07611400983324").getGtin());
}
{% endhighlight %}

And here the implementation:

{% highlight ruby %}
public NodeP find(String gtin) {

  NodeP current = root;
  if (current == null)
    return null;

  while (!current.getGtin().equals(gtin)) {
    if (gtin.compareTo(current.getGtin()) < 0) {
      current = current.getLeft();
    } else {
      current = current.getRight();
    }
    if (current == null) //not found in children
      return null;
  }
  return current;
}
{% endhighlight %}

This Binary Search Tree works well when the data is inserted in random order. Therefore, when the values to be inserted are already *ordered*, a binary tree becomes unbalanced. With an unbalanced tree, we can not find data quickly.

One approach to solving unbalanced trees is the [red-black tree](https://en.wikipedia.org/wiki/Red%E2%80%93black_tree){:target="_blank"} technique, which is a binary search tree with some special features.

Assuming that we already have a balanced tree, the following algorithm shows us how fast in terms of comparisons could be a binary search tree which depends on a number *N* of elements. For instance, in 1 billion products, to find a product by GTIN, the algorithm needs only 30 comparisons. See [Big O Notation]({% post_url 2020-06-22-big-o-notation-analysis-of-algorithms %}){:target="_blank"}.

{% highlight ruby %}
@Test
public void whenNelements_return_NroComparisons(){
  assertTrue(treePerformance.comparisons(15) <= 4);
  assertTrue(treePerformance.comparisons(31) <= 5);
  assertTrue(treePerformance.comparisons(1000) <=10);
  assertTrue(treePerformance.comparisons(1000000000) <=30);
}
{% endhighlight %}

You can see the implementation of treePerformance algorithm in the following [link](https://amzn.to/2LqceUy){:target="_blank"}:

<iframe type="text/html" width="336" height="550" frameborder="0" allowfullscreen style="max-width:100%" src="https://lesen.amazon.de/kp/card?asin=B086JCK6C4&preview=inline&linkCode=kpe&ref_=cm_sw_r_kb_dp_f2H6Fb7NENATK&tag=codersite20-20" ></iframe>

