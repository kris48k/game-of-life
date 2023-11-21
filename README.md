Pure JS implementation of [Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)

# How To Run

Since the app uses Worker and modules, it need local web server to avoid CORS Issues.

0. Have node (of version 12.20 and higher) and npm [installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
1. To install local simple web server, run: `npm i` from root of the project.
2. Run `npm run dev` to run the local server.
3. Visit http://127.0.0.1:8000 in the browser. Please open the app in modern browser so it supports modules and workers.

# How to play

1. Choose the size of the grid in the input. Then press button "Generate Grid".
2. Create first generation: click on "Generate randomly". You can also pick alive cells by clicking on any grid cells.
3. You can either manually go through each generation step. For that press 'Next Generation' button. Or you can generate new generation each second, buy pressing "Autogenerate" button.
4. You can always switch between manual and auto generation.
5. On the left side you will see the logs: how long each iteration have taken.
6. The game ends, when generation repeated, or all cells extinct.

# Performance issues

The bigger the Grid size, the longer it takes to make each generation step. All the measures further are made on 1000x1000 grid.

## First time layout for 1000x1000 grid

The slowest part is Browser layout step. It takes **4 sec**.

I attempeted different ways of painting grid: https://jsbench.me/74lp4834rm/1.
As in tests and in this app, `innerHtml` way give fastes result.

Also the styling of grid can affect speed: the slowest was organizig cells through `display: grid`. And `display: flex` gave slightly better result. But displaying cells through `display: inline-block` gave twice better result than flex and grid.

## Random generation alive tiles of first generation for 1000x1000 grid

Takes 140 sec. But the ui isn't cloged and alive tiles added progressively.
Could be improved: calculating randomeness in separate worker.

## Next Generation for 1000x1000 grid

The process of new generation making split into 3 steps:

1. Calculatin the new generation. It happenes in Worker and takes 0.4 sec. If it's done on the main thread, it would take 4 times longer.

2. When worker is done, we apply tiles that change. I.e. picking a DOM element, and apply bg color to it. It takes 0.9 sec for all changed tiles.

3. After that browser still does painting step itself, it takes 0.6sec. During this step, the most heavy tasks for the browser:

   - Recalculate style - 25% of the time,
   - Paint - 50% of the time,
   - Commit - 25% of the time.

4. To keep track and compare each generation, we store hash of a boolean array denoting each state of a cell by index. Then we split the string of binary numbers into chunks of 64digits, convert it to integer and pick up a char code corresponding that number. Glueing up all chars, we get a string corresponding to the generation state. For 1000x1000 grid, the length of the string could be of 62k characters. Hashes of all generations are stored as keys of associated map, so each generation we can quickly check if generation is repeated.

# What else could be improved

1. Paint only those areas, that are seen on the screen.
2. We can precalculate future generation on the Worker, until there was any request from the main thread.
