export interface TeamMember {
  id: string;
  name: string;
  role: string;
  handle: string;
  avatar: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'user_1',
    name: 'Sarah Jenkins',
    role: 'Lead Architect',
    handle: 'sarah',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_2',
    name: 'Alex Rivera',
    role: 'DevOps Lead',
    handle: 'alex',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_3',
    name: 'Marcus Vance',
    role: 'Product Manager',
    handle: 'marcus',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_4',
    name: 'Elena Rostova',
    role: 'UX Designer',
    handle: 'elena',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_5',
    name: 'David Chen',
    role: 'QA Engineer',
    handle: 'david',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
  },
];
