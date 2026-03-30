const loadTimeline = (jsonPath) => {
    const notesContainer = $('#notesContainer');

    $.getJSON(jsonPath, (json) => {
        rawData = json.timeline;
        trackOffsets = rawData.map(d => d.offset);
        zoomRange.oninput = (e) => {
            unit = parseInt(e.target.value);
            zoomVal.innerText = unit + "px/s";
            renderTimeline();
        };

        if (notesContainer) {
            if (json.notes === '' || json.notes == null) {
                notesContainer.hide();
            } else {
                notesContainer.show();
                const noteText = json.notes ? json.notes.trim() : '';
                const noteHtml = noteText
                    .replace(/((?:https?:\/\/|www\.)[^\s]+)/g, (url) => {
                        const href = url.startsWith('http') ? url : `http://${url}`;
                        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
                    })
                    .replace(/\n/g, '<br/>');
                notesContainer.html(`<span class="notes-label">備註：</span>${noteHtml}`);
            }
        }



        renderTimeline();
    })
};

const formatTime = (totalSeconds) => {
    const s = Math.abs(totalSeconds);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return (totalSeconds < 0 ? "-" : "") + m + ":" + sec.toString().padStart(2, '0');
}

const renderTimeline = () => {
    masterAxis.innerHTML = '';
    tracksArea.innerHTML = '';

    const trackUpdaters = [];

    for (let i = -10; i <= 900; i += 5) {
        const tick = document.createElement('div');
        const isMajor = i % 30 === 0;
        tick.className = 'tick' + (isMajor ? ' major' : '');
        tick.style.left = ((i + 10) * unit) + 'px';
        if (i % 10 === 0) tick.innerText = formatTime(i);
        masterAxis.appendChild(tick);
    }

    rawData.forEach((item, index) => {
        const currentOffset = trackOffsets[index];
        const track = document.createElement('div');
        if (item.type == "loop") {
            track.className = 'track track-loop';
        } else {
            track.className = 'track track-phase';
        }
        track.style.left = ((currentOffset + 10) * unit) + 'px';
        track.style.top = (90 + (item.track - 1) * 170) + 'px';

        const header = document.createElement('div');
        header.className = 'track-header';
        header.innerHTML = `${item.label} <span class="offset-hint">${formatTime(currentOffset)}</span>`;
        track.appendChild(header);

        let maxTime = 0;
        const eventEls = [];
        item.events.forEach((ev, idx) => {
            if (ev.time > maxTime) maxTime = ev.time;
            const evEl = document.createElement('div');
            evEl.className = 'event';
            evEl.style.left = (ev.time * unit) + 'px';
            evEl.innerHTML = `
                        <div class="rel-time">${ev.time}s</div>
                        <div class="line" style="background:${ev.color == null ? '#00d2ff' : ev.color}"></div>
                        ${ev.important == true ? '<div class="name">' + ev.eventName + '</div>' : ''}
                        <div class="tips text-center">${ev.eventName}<br/>${formatTime(currentOffset + ev.time)}</div>
                        <div class="abs-time">${formatTime(currentOffset + ev.time)}</div>
                    `;
            track.appendChild(evEl);
            eventEls.push({ el: evEl.querySelector('.abs-time'), relT: ev.time });
        });

        const trackDuration = Math.max(60, maxTime + 15);
        track.style.width = (trackDuration * unit) + 'px';

        trackUpdaters.push((newOffset) => {
            header.querySelector('.offset-hint').innerText = formatTime(newOffset);
            eventEls.forEach(obj => {
                obj.el.innerText = formatTime(newOffset + obj.relT);
            });
        });

        track.onmousedown = (e) => {
            if (e.target !== track && !e.target.closest('.track-header') && !e.target.closest('.event')) return;

            const startX = e.pageX;
            const myGroup = item.group;
            const indicesToMove = myGroup ? rawData.map((d, i) => d.group === myGroup ? i : -1).filter(i => i !== -1) : [index];
            const groupStartLefts = indicesToMove.map(i => tracksArea.children[i].offsetLeft);

            const onMouseMove = (moveEvent) => {
                const diffX = moveEvent.pageX - startX;

                indicesToMove.forEach((trackIdx, arrayIdx) => {
                    const newLeft = groupStartLefts[arrayIdx] + diffX;
                    const targetTrack = tracksArea.children[trackIdx];

                    targetTrack.style.left = newLeft + 'px';
                    const newOffset = Math.round(newLeft / unit) - 10;
                    trackOffsets[trackIdx] = newOffset;
                    trackUpdaters[trackIdx](newOffset);
                });
            };

            const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        };

        tracksArea.appendChild(track);
    });
}