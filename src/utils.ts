export type Span = { start: number, end: number };
export type Diarisation = Record<string, Span[]>;

function mergeSpans(spans: Span[]): Span[] {
    if (!spans.length) return [];

    const sorted = [...spans].sort((a, b) => a.start - b.start);
    const merged: Span[] = [];

    let current = { ...sorted[0] };

    for (let i = 1; i < sorted.length; i++) {
        const next = sorted[i];

        if (next.start <= current.end) {
            current = {
                start: current.start,
                end: Math.max(current.end, next.end),
            };
        } else {
            merged.push(current);
            current = { ...next };
        }
    }

    merged.push(current);
    return merged;
}

export function addSpan(
    state: Diarisation,
    speaker: string,
    span: Span
): Diarisation {
    const next = {
        ...state,
        [speaker]: mergeSpans([
            ...(state[speaker] ?? []),
            span
        ]),
    };

    return next;
}

export function removeSpan(
    state: Diarisation,
    speaker: string,
    span: Span
): Diarisation {
    const spans = state[speaker] ?? [];

    const result: Span[] = [];

    for (const s of spans) {
        // no overlap → keep as-is
        if (span.end <= s.start || span.start >= s.end) {
            result.push(s);
            continue;
        }

        // full cover → remove entire span
        if (span.start <= s.start && span.end >= s.end) {
            continue;
        }

        // left cut
        if (span.start <= s.start && span.end < s.end) {
            result.push({
                start: span.end,
                end: s.end,
            });
            continue;
        }

        // right cut
        if (span.start > s.start && span.end >= s.end) {
            result.push({
                start: s.start,
                end: span.start,
            });
            continue;
        }

        // middle split
        result.push(
            { start: s.start, end: span.start },
            { start: span.end, end: s.end }
        );
    }

    return {
        ...state,
        [speaker]: mergeSpans(result),
    };
}

export function toggleSpan(
    state: Diarisation,
    speaker: string,
    index: number
): Diarisation {
    const spans = state[speaker] ?? [];
    const target = spans[index];
    if (!target) return state;

    const toggled: Span = {
        start: target.start < 0 ? Math.abs(target.start) : -target.start,
        end: target.end < 0 ? Math.abs(target.end) : -target.end,
    };

    const nextSpans = [...spans];
    nextSpans[index] = toggled;

    return {
        ...state,
        [speaker]: mergeSpans(nextSpans),
    };
}

export function overlap(aStart: number, aEnd: number, b: Span) {
    const start = Math.max(aStart, b.start);
    const end = Math.min(aEnd, b.end);
    return Math.max(0, end - start);
}
