let timer: ReturnType<typeof setTimeout>;

function startTimer(t: number, f: Function) {
    timer = setTimeout(f, t)
}
function stopTimer() {
    clearTimeout(timer)
}

export {startTimer, stopTimer}