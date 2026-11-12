-- schema.sql 다음에 SQL Editor에서 한 번 실행합니다.
-- reference/app.js의 seed와 같습니다. 예시 사례 10개, 그 가운데 앞 7개에 기록 1건.
-- 사례 번호는 K-001부터입니다. 이미 예시가 있으면 다시 넣지 않습니다.

do $seed$
begin
  if exists (select 1 from cases where is_example) then
    raise notice '예시 사례가 이미 있어 seed를 건너뜁니다.';
    return;
  end if;

  insert into cases (
    id, code, is_example, source, age_band, months, factors, score, level, memo, memo_dir, memo_cat, created_at
  ) values
  ('eceef37b-6fb3-4df0-ad2a-6e569556253a'::uuid, 'K-001', true, 'generated', '50대', 8, '[{"key":"prior","name":"이전 처분 횟수","lv":"low","note":"없음"},{"key":"housing","name":"주거 상태","lv":"low","note":"안정"},{"key":"work","name":"취업·학업","lv":"low","note":"안정적으로 다님"},{"key":"support","name":"지원해 줄 사람","lv":"low","note":"연락 가능한 가족 여럿"},{"key":"care","name":"치료·상담","lv":"low","note":"꾸준히 참여"},{"key":"habit","name":"음주 등 생활 습관","lv":"mid","note":"언급 있음"}]'::jsonb, 8, 'low', '특이 사항 없음. 정해진 면담은 모두 나왔습니다.', 'neu', '기타', '2026-11-11T15:11:08.766Z'::timestamptz),
  ('c47e9b9a-94d3-47e8-88cb-dbf05ad70f78'::uuid, 'K-002', true, 'generated', '30대', 10, '[{"key":"prior","name":"이전 처분 횟수","lv":"high","note":"2회 이상"},{"key":"housing","name":"주거 상태","lv":"high","note":"자주 변경"},{"key":"work","name":"취업·학업","lv":"high","note":"없음"},{"key":"support","name":"지원해 줄 사람","lv":"high","note":"없음"},{"key":"care","name":"치료·상담","lv":"high","note":"거부"},{"key":"habit","name":"음주 등 생활 습관","lv":"high","note":"반복"}]'::jsonb, 100, 'high', '면담 중 최근 음주가 늘었다고 스스로 말했습니다.', 'neg', '음주 등 생활 습관', '2026-11-11T15:11:08.772Z'::timestamptz),
  ('361536e7-3787-4029-9017-87cc05655509'::uuid, 'K-003', true, 'generated', '20대', 18, '[{"key":"prior","name":"이전 처분 횟수","lv":"low","note":"없음"},{"key":"housing","name":"주거 상태","lv":"low","note":"안정"},{"key":"work","name":"취업·학업","lv":"low","note":"안정적으로 다님"},{"key":"support","name":"지원해 줄 사람","lv":"low","note":"연락 가능한 가족 여럿"},{"key":"care","name":"치료·상담","lv":"low","note":"꾸준히 참여"},{"key":"habit","name":"음주 등 생활 습관","lv":"low","note":"문제 없음"}]'::jsonb, 0, 'low', '특이 사항 없음. 정해진 면담은 모두 나왔습니다.', 'neu', '기타', '2026-11-11T15:11:08.772Z'::timestamptz),
  ('1c41a436-8d7f-4c50-bdbe-200e225a0563'::uuid, 'K-004', true, 'generated', '20대', 3, '[{"key":"prior","name":"이전 처분 횟수","lv":"low","note":"없음"},{"key":"housing","name":"주거 상태","lv":"low","note":"안정"},{"key":"work","name":"취업·학업","lv":"high","note":"없음"},{"key":"support","name":"지원해 줄 사람","lv":"low","note":"연락 가능한 가족 여럿"},{"key":"care","name":"치료·상담","lv":"high","note":"거부"},{"key":"habit","name":"음주 등 생활 습관","lv":"high","note":"반복"}]'::jsonb, 48, 'mid', '상담 기관에서 최근 참여 태도가 눈에 띄게 좋아졌다고 알려 왔습니다.', 'pos', '치료·상담', '2026-11-11T15:11:08.773Z'::timestamptz),
  ('4429b278-89df-4753-87fd-5f411362ea79'::uuid, 'K-005', true, 'generated', '50대', 18, '[{"key":"prior","name":"이전 처분 횟수","lv":"mid","note":"1회"},{"key":"housing","name":"주거 상태","lv":"mid","note":"임시 거주"},{"key":"work","name":"취업·학업","lv":"mid","note":"불안정"},{"key":"support","name":"지원해 줄 사람","lv":"mid","note":"연락 가능한 1명"},{"key":"care","name":"치료·상담","lv":"mid","note":"권고만 받음"},{"key":"habit","name":"음주 등 생활 습관","lv":"mid","note":"언급 있음"}]'::jsonb, 50, 'mid', '새 거주지에 자리를 잡고 이웃과 마찰 없이 지냅니다.', 'pos', '주거 상태', '2026-11-11T15:11:08.773Z'::timestamptz),
  ('c2dd99cb-5997-4501-ad92-1019444ad654'::uuid, 'K-006', true, 'generated', '50대', 14, '[{"key":"prior","name":"이전 처분 횟수","lv":"high","note":"2회 이상"},{"key":"housing","name":"주거 상태","lv":"high","note":"자주 변경"},{"key":"work","name":"취업·학업","lv":"mid","note":"불안정"},{"key":"support","name":"지원해 줄 사람","lv":"mid","note":"연락 가능한 1명"},{"key":"care","name":"치료·상담","lv":"high","note":"거부"},{"key":"habit","name":"음주 등 생활 습관","lv":"high","note":"반복"}]'::jsonb, 84, 'high', '특이 사항 없음. 정해진 면담은 모두 나왔습니다.', 'neu', '기타', '2026-11-11T15:11:08.773Z'::timestamptz),
  ('cb846e00-4243-4cc3-bfb6-e5e64e5b8cd1'::uuid, 'K-007', true, 'generated', '40대', 8, '[{"key":"prior","name":"이전 처분 횟수","lv":"low","note":"없음"},{"key":"housing","name":"주거 상태","lv":"mid","note":"임시 거주"},{"key":"work","name":"취업·학업","lv":"mid","note":"불안정"},{"key":"support","name":"지원해 줄 사람","lv":"mid","note":"연락 가능한 1명"},{"key":"care","name":"치료·상담","lv":"mid","note":"권고만 받음"},{"key":"habit","name":"음주 등 생활 습관","lv":"mid","note":"언급 있음"}]'::jsonb, 39, 'mid', '특이 사항 없음. 정해진 면담은 모두 나왔습니다.', 'neu', '기타', '2026-11-11T15:11:08.773Z'::timestamptz),
  ('b368fe31-3ac0-41e2-8c7f-36064776ba68'::uuid, 'K-008', true, 'generated', '40대', 14, '[{"key":"prior","name":"이전 처분 횟수","lv":"mid","note":"1회"},{"key":"housing","name":"주거 상태","lv":"mid","note":"임시 거주"},{"key":"work","name":"취업·학업","lv":"mid","note":"불안정"},{"key":"support","name":"지원해 줄 사람","lv":"high","note":"없음"},{"key":"care","name":"치료·상담","lv":"mid","note":"권고만 받음"},{"key":"habit","name":"음주 등 생활 습관","lv":"high","note":"반복"}]'::jsonb, 65, 'high', '평가 이후 3개월째 같은 일터에 나가고 있고 출근이 일정합니다.', 'pos', '취업·학업', '2026-11-11T15:11:08.773Z'::timestamptz),
  ('4a682ffa-ddd0-4135-904a-c61d77e48661'::uuid, 'K-009', true, 'generated', '50대', 1, '[{"key":"prior","name":"이전 처분 횟수","lv":"high","note":"2회 이상"},{"key":"housing","name":"주거 상태","lv":"mid","note":"임시 거주"},{"key":"work","name":"취업·학업","lv":"mid","note":"불안정"},{"key":"support","name":"지원해 줄 사람","lv":"mid","note":"연락 가능한 1명"},{"key":"care","name":"치료·상담","lv":"mid","note":"권고만 받음"},{"key":"habit","name":"음주 등 생활 습관","lv":"mid","note":"언급 있음"}]'::jsonb, 61, 'mid', '상담 기관에서 최근 참여 태도가 눈에 띄게 좋아졌다고 알려 왔습니다.', 'pos', '치료·상담', '2026-11-11T15:11:08.773Z'::timestamptz),
  ('743c7bc3-43dd-4abf-b1cd-19846a695e6d'::uuid, 'K-010', true, 'generated', '40대', 1, '[{"key":"prior","name":"이전 처분 횟수","lv":"mid","note":"1회"},{"key":"housing","name":"주거 상태","lv":"mid","note":"임시 거주"},{"key":"work","name":"취업·학업","lv":"mid","note":"불안정"},{"key":"support","name":"지원해 줄 사람","lv":"high","note":"없음"},{"key":"care","name":"치료·상담","lv":"mid","note":"권고만 받음"},{"key":"habit","name":"음주 등 생활 습관","lv":"mid","note":"언급 있음"}]'::jsonb, 57, 'mid', '상담 기관에서 최근 참여 태도가 눈에 띄게 좋아졌다고 알려 왔습니다.', 'pos', '치료·상담', '2026-11-11T15:11:08.773Z'::timestamptz);

  insert into records (
    id, case_id, is_example, level, decision, reason_cat, reason_text, created_at
  ) values
  ('de319b98-49ad-4bae-9732-9e6351581af5'::uuid, 'eceef37b-6fb3-4df0-ad2a-6e569556253a'::uuid, true, 'low', 'down', '', '', '2026-11-06T05:54:23.811Z'::timestamptz),
  ('70c63e17-8a4b-4064-9207-0f87eaba175c'::uuid, 'c47e9b9a-94d3-47e8-88cb-dbf05ad70f78'::uuid, true, 'high', 'up', '', '', '2026-11-06T03:01:03.164Z'::timestamptz),
  ('d5eb6cc4-7eae-4654-ac91-54676113438d'::uuid, '361536e7-3787-4029-9017-87cc05655509'::uuid, true, 'low', 'down', '', '', '2026-11-06T15:23:44.972Z'::timestamptz),
  ('f8ac88c7-e0a8-4379-be4a-a5375f449bc9'::uuid, '1c41a436-8d7f-4c50-bdbe-200e225a0563'::uuid, true, 'mid', 'down', '치료·상담', '상담 기관에서 최근 참여 태도가 눈에 띄게 좋아졌다고 알려 왔습니다.', '2026-11-06T01:25:35.029Z'::timestamptz),
  ('42484071-a8b0-45a3-b992-d47d5ddd2447'::uuid, '4429b278-89df-4753-87fd-5f411362ea79'::uuid, true, 'mid', 'down', '주거 상태', '새 거주지에 자리를 잡고 이웃과 마찰 없이 지냅니다.', '2026-11-10T10:27:54.896Z'::timestamptz),
  ('9fe185c0-91ef-4c92-8e56-356666869ada'::uuid, 'c2dd99cb-5997-4501-ad92-1019444ad654'::uuid, true, 'high', 'up', '', '', '2026-11-10T08:47:26.172Z'::timestamptz),
  ('9f9a10e0-1a40-48c0-80b9-686fa236c305'::uuid, 'cb846e00-4243-4cc3-bfb6-e5e64e5b8cd1'::uuid, true, 'mid', 'keep', '', '', '2026-11-10T06:10:18.689Z'::timestamptz);
end
$seed$;
