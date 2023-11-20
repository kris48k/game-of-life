Pure JS implementation of [Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)

Performance issues:

# Measures with the current solution for 500x500 grid:

1.5 sec recalc next generation,
0.3 sec applying styles (background colors),
0.3 sec repaint

# Inital paint of 1000x100o grid

I attempeted different ways of painting grid: https://jsbench.me/74lp4834rm/1.
As in tests and in this app, `innerHtml` way give fastes result.

Also the styling of grid can affect speed: the slowest was organizig cells thru `display: grid`. And `display: flex` gave slightly better result. But displaying cells thru `display: inline-block` gave twice better result than flex and grid.
