const joinRecord = (items, separator, fallback) => {
  const values = Array.isArray(items) ? items.filter(Boolean) : [];
  return values.length ? values.join(separator) : fallback;
};

export function createMuseumGuide(project = {}) {
  const timelineEntry = Array.isArray(project.timeline) ? project.timeline.find((entry) => entry?.title || entry?.detail) : null;
  const timeline = timelineEntry
    ? [timelineEntry.title, timelineEntry.detail].filter(Boolean).join(' — ')
    : '개발 로그 준비 중';

  return {
    title: project.title ?? '이름 없는 전시',
    summary: project.summary ?? '프로젝트 설명을 기록하는 중입니다.',
    stack: joinRecord(project.stack, ' · ', '기록 준비 중'),
    flow: joinRecord(project.flow, ' → ', '흐름 기록 준비 중'),
    role: project.role ?? '담당 역할 기록 준비 중',
    detail: project.detail ?? '프로젝트의 문제와 구현 과정을 기록하는 중입니다.',
    timeline,
    prompt: 'J 설명 보기 · E 전체 전시 열기',
  };
}
