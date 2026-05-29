let currentPuzzle
const q = (a) => document.getElementById(a)
const odd = (_, a) => (a + 1) % 2 !== 0
const div = document.createElement('div')
div.innerHTML = `<div style="background-color:white; padding:1.3rem;width:300px; border-radius:25px; font-family:Roboto; z-index:9999; position:fixed; top:0"><h1 style="color:#bababa">Puzzle Cheats</h1><p id="cheat-id"></p><p id="cheat-steps" class="hidden-acp"></p><p id="cheat-rating" class="hidden-acp"></p><p id="cheat-info"></p><button class="hidden-acp" id="cheat-button" style="border:none; padding:5px; border-radius:10px; background:#bababa; color:white" class="hidden-acp">Fetch Puzzle</button> <button class="hidden-acp" id="cheat-pgn" style="border:none; padding:5px; border-radius:10px; background:#bababa; color:white">Get PGN</button> <button class="hidden-acp" id="cheat-themes" style="border:none; padding:5px; border-radius:10px; background:#bababa; color:white">Get Puzzle Themes</button> <button id="cheat-acp" style="border:none; padding:5px; border-radius:10px; background:#bababa; color:white" class="hidden-acp">Activate Auto Complete Puzzles</button></div>`
document.body.appendChild(div)
const puzzle_info = q('cheat-info')
q('cheat-acp').onclick = function () { 
    window.alert('Started auto complete, Refresh to disable auto complete.')
    document.querySelectorAll('.hidden-acp').forEach(i => {
        i.remove()
    })
    let currentId
    let rating
    const idTag = document.querySelector('a[href^="/training/"]:not([href*=themes]):not([href*=dashboard]):not([href*=coordinate])')
    const form = new FormData()

    form.append('win', 'true')
    form.append('rated', 'true')

    const doPuzzle = async function (id) {
        const data = await fetch(`https://lichess.org/training/complete/mix/${id}`, { "method": 'POST', "body": form }).then(r => r.json()).catch(e => e)
        if (!(data instanceof Error)) {
            rating = data.next.user.rating
            puzzle_info.innerText = `Rating is now ${rating}`
            currentId = data.next.puzzle.id
            q('cheat-id').innerHTML = `#${currentId}`
            doPuzzle(currentId)
        } else {
            puzzle_info.innerText = 'An error accored, Trying again in 2 seconds'
            setTimeout(() => doPuzzle(currentId), 2000)
        }
    }
    doPuzzle(idTag.innerHTML.slice(1))
}
async function getPuzzleInfo() {
    const id = document.querySelector('a[href^="/training/"]:not([href*=themes]):not([href*=dashboard]):not([href*=coordinate])')
    puzzle_info.innerText = `Fetching ${id.innerText}`
    const html = await fetch(id.href).then(r => r.text())
    puzzle_info.innerText = ''
    const firstHalf = html.slice(html.indexOf('page-init-data">') + 16)
    const jsonStr = firstHalf.slice(0, firstHalf.lastIndexOf('</script>'))
    const json = JSON.parse(jsonStr)
    currentPuzzle = json
    const moves = json.data.puzzle.solution.filter(odd)
    const formatMove = (a) => {
        a = a.toUpperCase()
        const parts = [a.slice(0, 2), a.slice(2, 4)]
        return `Move ${parts.join(' to ')}`
    }
    const instructions = moves.map(formatMove).join(' then ')
    q('cheat-id').innerText = 'ID: ' + id.innerText
    q('cheat-steps').innerText = 'Steps: ' + instructions
    q('cheat-rating').innerText = 'Rating: ' + json.data.puzzle.rating
}
q('cheat-button').onclick = getPuzzleInfo
q('cheat-pgn').onclick = function () {
    if (currentPuzzle) window.alert(currentPuzzle.data.game.pgn)
}
q('cheat-themes').onclick = function () {
    if (currentPuzzle) window.alert(currentPuzzle.data.puzzle.themes.join('\n'))
}
