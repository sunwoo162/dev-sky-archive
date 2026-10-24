import assert from 'node:assert/strict';
import test from 'node:test';

import { createMuseumGuide } from '../src/museum.js';

const project = {
  id: 'sample-project',
  title: 'Sample Project',
  summary: '화면과 데이터를 연결하는 샘플 프로젝트.',
  role: '프론트엔드 구현 · 인터랙션 설계',
  stack: ['HTML', 'CSS', 'JavaScript'],
  flow: ['Input', 'State', 'View'],
  detail: '사용자의 입력이 상태를 거쳐 화면으로 이어지는 구조를 실험했다.',
  timeline: [
    { phase: '01', title: '구조 정의', detail: '입력과 화면의 경계를 정했다.' },
  ],
};

test('museum guide turns project records into readable frontend field notes', () => {
  const guide = createMuseumGuide(project);

  assert.equal(guide.title, project.title);
  assert.equal(guide.summary, project.summary);
  assert.equal(guide.stack, 'HTML · CSS · JavaScript');
  assert.equal(guide.flow, 'Input → State → View');
  assert.equal(guide.role, project.role);
  assert.equal(guide.timeline, '구조 정의 — 입력과 화면의 경계를 정했다.');
  assert.match(guide.prompt, /J/);
  assert.match(guide.prompt, /E/);
});

test('museum guide remains useful when optional record fields are missing', () => {
  const guide = createMuseumGuide({ title: 'Untitled', stack: [] });

  assert.equal(guide.title, 'Untitled');
  assert.equal(guide.stack, '기록 준비 중');
  assert.equal(guide.flow, '흐름 기록 준비 중');
  assert.equal(guide.timeline, '개발 로그 준비 중');
});
