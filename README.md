# cssparser
One declaration per selector.  This will only work with a CSS that has very good specificity, like BEM.

It makes this
.hello { font: 14px; color: #AFEEEE }
.world { font: 14px; color: #9ACD32 }

Into this
.hello, .world { font: 14px; }
.hello { color: #AFEEEE }
.world { color: #9ACD32 }
