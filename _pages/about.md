---
layout: page
title: About me
description: Moisés Gamio — software engineer with 20+ years of experience. I write codersite.dev to make complex computer science and software design easy to understand.
permalink: /about
comments: false
---

<style>
.about-page p { line-height: 1.7; }
.about-hero { display: flex; flex-wrap: wrap; align-items: center; gap: 1.75rem; margin-bottom: 2.5rem; }
.about-hero .about-photo { flex: 0 0 200px; max-width: 200px; }
.about-hero .about-photo img { width: 100%; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.18); }
.about-hero .about-intro { flex: 1 1 320px; }
.about-intro .eyebrow { text-transform: uppercase; letter-spacing: .12em; font-size: .78rem; font-weight: 700; color: rgba(0,0,0,.45); margin-bottom: .35rem; }
.about-intro h3 { font-weight: 700; font-size: 1.65rem; margin: 0 0 .75rem; line-height: 1.25; }
.about-lead { font-size: 1.08rem; color: rgba(0,0,0,.72); margin-bottom: 1rem; }
.about-stats { display: flex; flex-wrap: wrap; gap: 1.5rem; margin: 0 0 2.5rem; padding: 1.1rem 0; border-top: 1px solid rgba(0,0,0,.08); border-bottom: 1px solid rgba(0,0,0,.08); }
.about-stats .stat { flex: 1 1 120px; }
.about-stats .stat .num { font-size: 1.5rem; font-weight: 700; color: #111; display: block; }
.about-stats .stat .label { font-size: .85rem; color: rgba(0,0,0,.5); }
.about-section { margin-bottom: 2.5rem; }
.about-section h4 { font-weight: 700; margin-bottom: 1rem; }
.skill-pills { list-style: none; padding-left: 0; margin: 0; }
.skill-pills li { display: inline-block; margin: 0 .4rem .55rem 0; }
.skill-pills li span { background: rgba(0,0,0,.05); color: rgba(0,0,0,.65); border-radius: 999px; padding: 6px 14px; font-size: .9rem; display: inline-block; }
.social-row { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; margin-top: .5rem; }
.social-row a { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: rgba(0,0,0,.05); transition: background .15s ease, transform .15s ease; }
.social-row a:hover { background: rgba(0,0,0,.1); transform: translateY(-2px); }
.social-row a img, .social-row a svg { width: 24px; height: 24px; }
.coffee-btn { display: inline-flex; align-items: center; gap: .5rem; background: #FFDD00; color: #000; font-weight: 700; padding: 12px 22px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(0,0,0,.12); transition: transform .15s ease, box-shadow .15s ease; }
.coffee-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,.18); color: #000; text-decoration: none; }
.books-heading { font-weight: 700; margin-bottom: .25rem; }
.books-intro { font-size: .9rem; color: rgba(0,0,0,.5); margin-bottom: 1.25rem; }
.book-card { margin-bottom: 2rem; }
.book-card img { width: 100%; border-radius: 6px; box-shadow: 0 6px 18px rgba(0,0,0,.15); margin-bottom: .75rem; }
.book-card p { font-size: .92rem; color: rgba(0,0,0,.65); }
</style>

<div class="about-page">

<div class="row justify-content-between">

  <div class="col-lg-8 pr-lg-5">

    <!-- Hero / intro -->
    <div class="about-hero">
      <div class="about-photo">
        <img src="{{ site.baseurl }}/assets/images/moisesgamio.jpg" alt="Moisés Gamio, software engineer" />
      </div>
      <div class="about-intro">
        <div class="eyebrow">Software Engineer · Berlin, Germany</div>
        <h3>Hi, I'm Moisés Gamio.</h3>
        <p class="about-lead">For more than two decades I've built software for companies across very different worlds — from banks and government to retail and research. I created <strong>codersite.dev</strong> to share what I've learned and to make complex computer science and software design easy to understand.</p>
      </div>
    </div>

    <!-- Quick stats -->
    <div class="about-stats">
      <div class="stat"><span class="num">20+</span><span class="label">Years as a software engineer</span></div>
      <div class="stat"><span class="num">7</span><span class="label">Industries served</span></div>
      <div class="stat"><span class="num">2014</span><span class="label">Building in Berlin since</span></div>
    </div>

    <!-- Journey -->
    <div class="about-section">
      <h4>My journey</h4>
      <p>I was born in Lima, Peru, where I studied for five years and earned a degree in Systems Engineering. Over my career I've worked across the Government, Financial, Industrial, Education, Consulting, Retail, and Research sectors — covering every stage of the software lifecycle, from analysis and design to testing and deployment, in both on-premise and cloud environments.</p>
      <p>For eight years I worked as a Systems Analyst in the banking sector. Since 2014 I've been a software engineer at a B2B company in Berlin, Germany. Along the way I've programmed in a wide range of languages, which keeps me pragmatic about choosing the right tool for the job.</p>
    </div>

    <!-- Focus areas -->
    <div class="about-section">
      <h4>What I write about</h4>
      <p>On the blog I focus on the fundamentals that make us better engineers — the topics I'm most passionate about:</p>
      <ul class="skill-pills">
        <li><span>Clean Code</span></li>
        <li><span>Software Design</span></li>
        <li><span>Software Architecture</span></li>
        <li><span>Object-Oriented Programming</span></li>
        <li><span>Data Structures &amp; Algorithms</span></li>
        <li><span>RESTful Web Services</span></li>
        <li><span>Spring Framework</span></li>
        <li><span>Automated Testing</span></li>
        <li><span>Distributed Systems</span></li>
        <li><span>Cloud Computing</span></li>
      </ul>
    </div>

    <!-- Languages -->
    <div class="about-section">
      <h4>Languages I've worked with</h4>
      <ul class="skill-pills">
        <li><span>Java</span></li>
        <li><span>Python</span></li>
        <li><span>C#</span></li>
        <li><span>C</span></li>
        <li><span>PHP</span></li>
        <li><span>PL/SQL</span></li>
        <li><span>Visual Basic</span></li>
        <li><span>Prolog</span></li>
        <li><span>COBOL</span></li>
        <li><span>JScript</span></li>
      </ul>
    </div>

    <!-- Connect -->
    <div class="about-section">
      <h4>Let's connect</h4>
      <p>I'm always happy to talk shop. Find me here:</p>
      <div class="social-row">
        <a href="https://www.linkedin.com/in/moises-gamio-b4370210/" target="_blank" rel="noopener" title="LinkedIn" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z"/></svg>
        </a>
        <a href="https://github.com/mgamio" target="_blank" rel="noopener" title="GitHub" aria-label="GitHub"><img src="{{ site.baseurl }}/assets/images/github.png" alt="GitHub" /></a>
        <a href="https://medium.com/@mkgv89" target="_blank" rel="noopener" title="Medium" aria-label="Medium"><img src="{{ site.baseurl }}/assets/images/medium-28.png" alt="Medium" /></a>
        <a href="http://www.twitter.com/MoisesGamio" target="_blank" rel="noopener" title="X / Twitter" aria-label="X / Twitter"><img src="{{ site.baseurl }}/assets/images/twitter.png" alt="X / Twitter" /></a>
        <a href="https://www.facebook.com/codersite.dev" target="_blank" rel="noopener" title="Facebook" aria-label="Facebook"><img src="{{ site.baseurl }}/assets/images/facebook.png" alt="Facebook" /></a>
      </div>
    </div>

    <!-- Support -->
    <div class="about-section">
      <h4>Support my work</h4>
      <p>codersite.dev is a labour of love. If an article has helped you, please consider supporting the blog — every contribution, no matter how small, helps me add more content. Thank you!</p>
      <a class="coffee-btn" href="https://buymeacoffee.com/codersite" target="_blank" rel="noopener">☕ Buy me a coffee</a>
    </div>

  </div>

  <!-- Sidebar: my books -->
  <div class="col-lg-4">
    <div class="sticky-top sticky-top-80">

      <h4 class="books-heading">My books</h4>
      <p class="books-intro">Everything I've learned over the years, distilled into two practical guides.</p>

      <div class="book-card">
        <a href="https://amzn.to/3Nwp1om" target="_blank" rel="noopener"><img alt="Top Java Challenges: Cracking the Coding Interview — book by Moisés Gamio" src="{{ site.baseurl }}/recommended/images/codingInterview2ndEdition.png"></a>
        <p>My collection of real Java interview challenges. Stop losing interviews because you can't master algorithms — learn to solve problems the way top engineers do.</p>
        <div class="text-center"><a target="_blank" rel="noopener" href="https://amzn.to/3Nwp1om" class="btn btn-danger">Get it on Amazon</a></div>
      </div>

      <div class="book-card">
        <a href="https://amzn.to/3AucVBA" target="_blank" rel="noopener"><img alt="Software Design Principles: A Practical Guide — book by Moisés Gamio" src="{{ site.baseurl }}/assets/images/SoftwareDesignPortadaJPG.jpg"></a>
        <p>My practical guide to software design — real-world examples, diagrams, and clear explanations that make complex systems simple.</p>
        <div class="text-center"><a target="_blank" rel="noopener" href="https://amzn.to/3AucVBA" class="btn btn-danger">Get it on Amazon</a></div>
      </div>

    </div>
  </div>

</div>

</div>
