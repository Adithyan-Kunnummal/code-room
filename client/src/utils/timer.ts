let timer: ReturnType<typeof setTimeout>

function startTimer(delayMs: number, callback: () => void) {
    timer = setTimeout(callback, delayMs)
}

function stopTimer() {
    clearTimeout(timer)
}

export { startTimer, stopTimer }