# cssparser
CSSParser delivers the minimum number of declarations for any given CSS file.  You can toggle the consolidation process so that you get solely one declaration per multiple selectors.  This parser will only work with CSS files that have very good specificity, or otherwise use a high specificity system such as BEM.

It makes this
```
.hello { font: 14px; color: #AFEEEE; }
.world { font: 14px; color: #9ACD32; border: 1px solid #8F7D70; }
```

Into this
```
.hello,.world{font:14px;}.hello{color:#AFEEEE;}.world{color:#9ACD32;border:1px solid #8F7D70;}
```

In other words, we have minimized the number of declarations in this CSS example
```
.hello, .world { font: 14px; } /* Selectors are grouped per matching declaration */
.hello { color: #AFEEEE; }
.world { color: #9ACD32; border: 1px solid #8F7D70; } /* Declarations are consolidated per matching selector group */ 
```

If consolidate is turned off, then CSSParser will return solely one declaration per selector(s)
```
.hello,.world{font:14px;}.hello{color:#AFEEEE;}.world{color:#9ACD32;}.world{border:1px solid #8F7D70;}
```

Or
```
.hello, .world { font: 14px; } /* Selectors are grouped per matching declaration */
.hello { color: #AFEEEE; }
.world { color: #9ACD32; } /* One declaration per selector group */
.world { border: 1px solid #8F7D70; } /* Regardless */
```
