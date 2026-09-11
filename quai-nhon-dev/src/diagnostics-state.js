// Read-only adapter. The world never advances a job or infers completion from its position.
export function deriveDiagnosticsState(job, stepClasses = []) {
  const parseStep = value => {
    const match = String(value ?? '').match(/^(\d{1,2})(?:\D|$)/);
    const number = match ? Number(match[1]) : 0;
    return number >= 1 && number <= 17 ? number : null;
  };
  const normalize = value => {
    const status = String(value || '').toLowerCase();
    if (['failed', 'error'].includes(status)) return 'failed';
    if (['completed', 'complete', 'succeeded', 'ready_for_review', 'approved', 'published'].includes(status)) return 'completed';
    if (['running', 'active', 'processing', 'claimed', 'downloading', 'rendering'].includes(status)) return 'active';
    if (['queued', 'pending', 'waiting'].includes(status)) return 'pending';
    if (['ready', 'paused'].includes(status)) return 'paused';
    return 'unknown';
  };
  const current = job ? parseStep(job.step) : null;
  const stages = Array.from({ length: 17 }, (_, index) => ({ number: index + 1, state: 'unknown', evidence: 'No stage status reported.', outputs: {} }));
  const progress = typeof job?.progress === 'number' && Number.isFinite(job.progress) ? Math.max(0,Math.min(100,job.progress)) : null;
  if (!job) return { current: null, stages, status: 'No job response', unlocatedFailure: false, progress };
  // Retain explicit completion/failure already exposed by the existing pipeline UI.
  // Its initial active/pending placeholders are deliberately not treated as live work.
  stages.forEach((stage, index) => {
    const classes = String(stepClasses[index] || '').split(/\s+/);
    if (classes.includes('completed') || classes.includes('failed')) {
      stage.state = classes.includes('failed') ? 'failed' : 'completed';
      stage.evidence = 'Reported by the existing pipeline inspector.';
    }
  });
  for (const [key, value] of Object.entries(job)) {
    let owner = value && typeof value === 'object' && !Array.isArray(value) ? parseStep(value.step) : null;
    if (key === 'source_manifest' || key === 'sources') owner = 1;
    if (key === 'shot_manifest') owner = 2;
    if (owner) stages[owner - 1].outputs[key] = value;
  }
  if (current) {
    const stage = stages[current - 1];
    stage.state = normalize(job.status);
    stage.evidence = 'Job response: step ' + String(job.step) + ', status ' + String(job.status ?? 'not reported') + '.';
    if (Object.hasOwn(job, 'output')) stage.outputs.output = job.output;
    if (Object.hasOwn(job, 'error')) stage.error = job.error;
  }
  return { current, stages, status: String(job.status || 'Not reported'), unlocatedFailure: normalize(job.status) === 'failed' && !current, progress };
}

// Position comes only from reported job.progress. It is not a per-stage completion estimate.
export function diagnosticsAgentPosition(stations, index, state, progress) {
  const from=stations[index],to=stations[index+1];
  const amount=to&&state==='active'&&progress!==null?progress/100:0;
  const end=to||from,controlX=(from[1]+end[1])/2,controlY=Math.max(from[2],end[2])+18;
  return {
    x:(1-amount)**2*from[1]+2*(1-amount)*amount*controlX+amount**2*end[1],
    y:(1-amount)**2*from[2]+2*(1-amount)*amount*controlY+amount**2*end[2]+30,
    amount
  };
}

// Resolve only supplied source identities. Never synthesize a path or choose among duplicates.
export function diagnosticsLineage(job) {
  const candidate = job?.source_manifest?.sources ?? job?.source_manifest?.clips ?? job?.sources;
  const sources = Array.isArray(candidate) ? candidate : [];
  const shots = Array.isArray(job?.shot_manifest?.shots) ? job.shot_manifest.shots : [];
  return shots.map(shot => {
    const matches = sources.filter(source => source.source_id === shot.source_id);
    return {
      shot_id: shot.shot_id ?? null, source_id: shot.source_id ?? null,
      local_path: shot.local_path ?? (matches.length === 1 ? matches[0].local_path ?? null : null),
      start_sec: shot.start_sec ?? null, end_sec: shot.end_sec ?? null,
      source_resolution: matches.length === 1 ? 'matched' : matches.length ? 'ambiguous' : 'not reported'
    };
  });
}
