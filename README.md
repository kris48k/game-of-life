Pure JS implementation of [Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)

Performance issues:

# First time layout for 1000x1000 grid

The slowest part is Browser layout step. It takes **4 sec**.

I attempeted different ways of painting grid: https://jsbench.me/74lp4834rm/1.
As in tests and in this app, `innerHtml` way give fastes result.

Also the styling of grid can affect speed: the slowest was organizig cells through `display: grid`. And `display: flex` gave slightly better result. But displaying cells through `display: inline-block` gave twice better result than flex and grid.

# Random generation alive tiles of first generation for 1000x1000 grid

Takes 140 sec. But the ui isn't cloged and alive tiles added progressively.
Could be improved: calculating randomeness in separate worker.

# Next Generation for 1000x1000 grid

The process of new generation making split into 3 steps:

1. Calculatin the new generation. It happenes in Worker and takes 0.4 sec. If it's done on the main thread, it would take 4 times longer.

2. When worker is done, we apply tiles that change. I.e. picking a DOM element, and apply bg color to it. It takes 0.9 sec for all changed tiles.

3. After that browser still does painting step itself, it takes 0.6sec. During this step, the most heavy tasks for the browser:
   - Recalculate style - 25% of the time,
   - Paint - 50% of the time,
   - Commit - 25% of the time.

# whats left

1. make auto generation making
2. moving out random generation into worker
3. buttons disable

# What else could be improved
1. Paint only those areas, that are seen on the screen.
