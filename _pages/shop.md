---
layout: page
title: Shop
description: Stickers, t-shirts, hoodies and mugs with Kit the Code Fox and the codersite badge, for developers who stay curious, ship code and grow.
permalink: /shop
comments: false
---

<style>
.shop-intro { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 2rem; }
.shop-intro img { flex: 0 0 96px; width: 96px; height: auto; }
.shop-intro p { margin-bottom: 0; }
#myShop { margin: 1.5rem 0 1rem; }
.shop-cta p { font-size: .95rem; color: rgba(0,0,0,.6); margin-bottom: .75rem; }
.shop-cta { text-align: center; margin: 0 0 1.5rem; }
.shop-cta a { display: inline-block; background: #194175; color: #fff; font-weight: 700; padding: 14px 28px; border-radius: 8px; text-decoration: none; }
.shop-cta a:hover { background: #12325c; color: #fff; text-decoration: none; }
.shop-note { font-size: .85rem; color: rgba(0,0,0,.55); }
@media (max-width: 480px) { .shop-intro { flex-direction: column; align-items: flex-start; } }
</style>

<div class="shop-intro">
  <img src="{{ site.baseurl }}/assets/images/brand/kit-the-code-fox.svg" alt="Kit, the codersite fox">
  <p>Wear what you believe in: <strong>Stay curious. Ship code. Grow.</strong> Every sticker, t-shirt and mug is printed on demand and shipped to you by Spreadshirt, and every purchase helps keep codersite's articles free.</p>
</div>

<p class="shop-note">The shop below is run by Spreadshirt (sprd.net AG, Leipzig), which sells and ships the products and handles payment and returns. Spreadshirt asks for your cookie choice first; the products appear after you choose. See our <a href="{{ site.baseurl }}/policy">privacy policy</a> for details.</p>

<div id="myShop">
  <a href="https://codersite.myspreadshop.de">codersite</a>
</div>

<div id="shop-waiting" class="shop-cta">
  <p>Choose an option in Spreadshirt's cookie banner to see the products here, or open the shop in a new tab:</p>
  <a href="https://codersite.myspreadshop.de/" target="_blank" rel="noopener">Open the shop on Spreadshirt</a>
</div>

<script>
  // Hide the fallback once the embedded shop has loaded and grown
  (function () {
    var shop = document.getElementById('myShop');
    var waiting = document.getElementById('shop-waiting');
    if (!shop || !waiting || !window.ResizeObserver) return;
    new ResizeObserver(function () {
      waiting.style.display = shop.offsetHeight > 200 ? 'none' : '';
    }).observe(shop);
  })();
</script>

<script>
  var spread_shop_config = {
    shopName: 'codersite',
    locale: 'en_DE',
    prefix: 'https://codersite.myspreadshop.de',
    baseId: 'myShop'
  };
</script>
<script type="text/javascript" src="https://codersite.myspreadshop.de/shopfiles/shopclient/shopclient.nocache.js"></script>
