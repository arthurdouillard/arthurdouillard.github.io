---
layout: page
title: About
---

{% comment %}
  This inserts the "about" photo and text from `_config.yml`.
  You can edit it there (jekyll needs restart!) or remove it and provide your own photo/text.
  Don't forget to add the `me` class to the photo, like this: `![alt](src){:.me}`.
{% endcomment %}

{% if site.author.photo %}
  ![{{ site.author.name }}]({{ site.author.photo }}){:.me}
{% endif %}

{{ site.author.about }}

***
<br/>
<div class="button_base b03_skewed_slide_in">
  <div>Download my resume</div>
    <div></div>
    <div>
      <a href="/public/cv/cv.pdf">
        Download my resume
      </a>
    </div>
</div>
<br/>
<div class="button_base b03_skewed_slide_in">
  <div>Portofolio</div>
    <div></div>
    <div>
      <a href="/portofolio">
        Portofolio
      </a>
    </div>
</div>

<hr/>

Here is a more detailed version of my resume:

<h2>Experience</h2>

<h4>Thales - AIR SYSTEM</h4>
<p>Logistic Engineer Internship (2015)</p>

<hr/>

<h4>POB-Technology</h4>
<p>Robotic Engineer Internship (2012)</p>

<hr/>

<h4>GENERALI</h4>
<p>Web design & Marketing (2011)</p>

<hr/>

<h2>Education</h2>

<h4>EPITA</h4>
<p>Paris, France - <i>(2014-2018)</i>
<ul>
  <li>C, C++, Java, ASM</li>
  <li>Computer Theory: Language, Graph, Algorithm, Complexity, Compiler, OOP, Operating System...</li>
  <li>Linear Algebra, Calculus, Probability...</li>
  <li>Wawes physics, Electronics</li>
</ul>

<hr/>

<h4>Hanyang University 한양대학교</h4>
<p>Seoul, Korea - <i>(2015)</i>
<ul>
  <li>C, Calculus, Operating System, Korean</li>
</ul>

<hr/>

<h4>Fenelon Sainte-Marie</h4>
<p>Paris, France - <i>(2013-2014)</i></p>
<p>Preparatory school focused intensively on Math/Physic/Computer.</p>
<ul>
  <li>Math</li>
  <li>Physic, Chemistry</li>
  <li>Engineer Sciences</li>
  <li>Python</li>
</ul>

<hr/>

## Blog Design

* Based on [Hyde](http://hyde.getpoole.com/)
* Also based on [Hydejacked](http://qwtel.com/hydejack/2016/03/08/introducing-hydejack/)
