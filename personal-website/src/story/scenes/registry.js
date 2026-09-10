import OnixScene from './OnixScene';
import SapUccScene from './SapUccScene';
import FoundationsScene from './FoundationsScene';
import ResearchScene from './ResearchScene';
import AgentsScene from './AgentsScene';
import AppliedScene from './AppliedScene';
import EducationScene from './EducationScene';

/** Maps a chapter id to the scene pinned behind it. */
const scenes = {
  foundations: FoundationsScene,
  scale: OnixScene,
  production: SapUccScene,
  research: ResearchScene,
  agents: AgentsScene,
  applied: AppliedScene,
  education: EducationScene,
};

export const sceneFor = (chapterId) => scenes[chapterId] ?? null;

export default scenes;
