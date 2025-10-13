import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tournamentAPI } from '../../services/api';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  game: string;
  format: 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss' | 'free-for-all';
  status: 'draft' | 'open' | 'in-progress' | 'completed' | 'cancelled';
  maxParticipants: number;
  currentParticipants: number;
  startDate: string;
  endDate?: string;
  registrationDeadline: string;
  organizer: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  league?: {
    id: string;
    name: string;
    type: string;
  };
  participants: Array<{
    user: {
      id: string;
      displayName: string;
      avatar?: string;
    };
    seed?: number;
    checkedIn: boolean;
    registeredAt: string;
    status: 'registered' | 'checked-in' | 'eliminated' | 'disqualified';
  }>;
  settings: {
    allowSelfRegistration: boolean;
    requireApproval: boolean;
    showAsOfficial: boolean;
    hideForum: boolean;
    allowParticipantScheduling: boolean;
    showRounds: boolean;
    allowMatchReporting: boolean;
  };
  bracketData?: {
    rounds: Array<{
      roundNumber: number;
      matches: Array<{
        matchId: string;
        player1?: string;
        player2?: string;
        winner?: string;
        status: 'pending' | 'in-progress' | 'completed' | 'bye';
        score?: {
          player1: number;
          player2: number;
        };
      }>;
      isComplete: boolean;
    }>;
    currentRound: number;
    totalRounds: number;
  };
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  rules?: string;
  visibility?: 'public' | 'unlisted' | 'private';
}

export interface TournamentState {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: string;
    game?: string;
    format?: string;
  };
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

const initialState: TournamentState = {
  tournaments: [],
  currentTournament: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    total: 0,
    limit: 20,
    skip: 0,
    hasMore: false,
  },
};

// Async thunks
export const fetchTournaments = createAsyncThunk(
  'tournaments/fetchTournaments',
  async (params: {
    status?: string;
    game?: string;
    format?: string;
    limit?: number;
    skip?: number;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await tournamentAPI.getTournaments(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch tournaments');
    }
  }
);

export const fetchTournament = createAsyncThunk(
  'tournaments/fetchTournament',
  async (tournamentId: string, { rejectWithValue }) => {
    try {
      const response = await tournamentAPI.getTournament(tournamentId);
      return response.tournament;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch tournament');
    }
  }
);

export const createTournament = createAsyncThunk(
  'tournaments/createTournament',
  async (tournamentData: {
    name: string;
    description?: string;
    game: string;
    format: Tournament['format'];
    maxParticipants: number;
    startDate: string;
    endDate?: string;
    registrationDeadline: string;
    settings?: Partial<Tournament['settings']>;
    rules?: string;
    league?: string;
    tags?: string[];
    visibility?: 'public' | 'unlisted' | 'private';
  }, { rejectWithValue }) => {
    try {
      const response = await tournamentAPI.createTournament(tournamentData);
      return response.tournament;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create tournament');
    }
  }
);

export const registerForTournament = createAsyncThunk(
  'tournaments/registerForTournament',
  async (tournamentId: string, { rejectWithValue }) => {
    try {
      await tournamentAPI.registerForTournament(tournamentId);
      return tournamentId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to register for tournament');
    }
  }
);

export const unregisterFromTournament = createAsyncThunk(
  'tournaments/unregisterFromTournament',
  async (tournamentId: string, { rejectWithValue }) => {
    try {
      await tournamentAPI.unregisterFromTournament(tournamentId);
      return tournamentId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to unregister from tournament');
    }
  }
);

const tournamentSlice = createSlice({
  name: 'tournaments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearCurrentTournament: (state) => {
      state.currentTournament = null;
    },
    updateTournamentInList: (state, action) => {
      const index = state.tournaments.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tournaments[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tournaments
      .addCase(fetchTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournaments.fulfilled, (state, action) => {
        state.loading = false;
        const shouldAppend = (action.meta.arg?.skip ?? 0) > 0;
        state.tournaments = shouldAppend
          ? [...state.tournaments, ...action.payload.tournaments]
          : action.payload.tournaments;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Tournament
      .addCase(fetchTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournament.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTournament = action.payload;
      })
      .addCase(fetchTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Tournament
      .addCase(createTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTournament.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments.unshift(action.payload);
      })
      .addCase(createTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register for Tournament
      .addCase(registerForTournament.pending, (state) => {
        state.error = null;
      })
      .addCase(registerForTournament.fulfilled, (state, action) => {
        // Update participant count in the tournament list
        const tournament = state.tournaments.find(t => t.id === action.payload);
        if (tournament) {
          tournament.currentParticipants += 1;
        }

        // Update current tournament if it's the same one
        if (state.currentTournament?.id === action.payload) {
          state.currentTournament.currentParticipants += 1;
        }
      })
      .addCase(registerForTournament.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Unregister from Tournament
      .addCase(unregisterFromTournament.pending, (state) => {
        state.error = null;
      })
      .addCase(unregisterFromTournament.fulfilled, (state, action) => {
        // Update participant count in the tournament list
        const tournament = state.tournaments.find(t => t.id === action.payload);
        if (tournament) {
          tournament.currentParticipants -= 1;
        }

        // Update current tournament if it's the same one
        if (state.currentTournament?.id === action.payload) {
          state.currentTournament.currentParticipants -= 1;
        }
      })
      .addCase(unregisterFromTournament.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilters, clearCurrentTournament, updateTournamentInList } = tournamentSlice.actions;
export default tournamentSlice.reducer;
