import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarPlus, Settings2, Tags, Users, ShieldCheck, Trophy } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createTournament, clearError } from '../store/slices/tournamentSlice';

interface TournamentFormData {
  name: string;
  description: string;
  game: string;
  format: 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss' | 'free-for-all';
  maxParticipants: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  settings: {
    allowSelfRegistration: boolean;
    requireApproval: boolean;
    showAsOfficial: boolean;
    hideForum: boolean;
    allowParticipantScheduling: boolean;
    showRounds: boolean;
    allowMatchReporting: boolean;
  };
  rules: string;
  tags: string[];
  visibility: 'public' | 'unlisted' | 'private';
}

const tournamentFormats = [
  { value: 'single-elimination', label: 'Single Elimination', description: 'Classic knockout bracket' },
  { value: 'double-elimination', label: 'Double Elimination', description: 'Give participants a second chance' },
  { value: 'round-robin', label: 'Round Robin', description: 'Everyone plays everyone else' },
  { value: 'swiss', label: 'Swiss System', description: 'Skill-based pairings across rounds' },
  { value: 'free-for-all', label: 'Free For All', description: 'Multiple competitors in each match' },
] as const;

const CreateTournamentPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.tournaments);
  const { user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    description: '',
    game: '',
    format: 'single-elimination',
    maxParticipants: 16,
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    settings: {
      allowSelfRegistration: true,
      requireApproval: false,
      showAsOfficial: false,
      hideForum: false,
      allowParticipantScheduling: false,
      showRounds: true,
      allowMatchReporting: true,
    },
    rules: '',
    tags: [],
    visibility: 'public',
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;

    if (name.startsWith('settings.')) {
      const key = name.split('.')[1] as keyof TournamentFormData['settings'];
      setFormData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          [key]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value === 'true',
        },
      }));
      return;
    }

    if (name === 'maxParticipants') {
      const parsed = Number(value);
      setFormData((prev) => ({
        ...prev,
        maxParticipants: Number.isNaN(parsed) ? prev.maxParticipants : parsed,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || formData.tags.includes(trimmed)) return;

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, trimmed],
    }));
    setTagInput('');
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateDates = () => {
    if (!formData.registrationDeadline || !formData.startDate) {
      toast.error('Registration deadline and start date are required.');
      return false;
    }

    const registration = new Date(formData.registrationDeadline);
    const start = new Date(formData.startDate);
    const end = formData.endDate ? new Date(formData.endDate) : null;

    if (!(registration instanceof Date) || Number.isNaN(registration.getTime())) {
      toast.error('Please provide a valid registration deadline.');
      return false;
    }

    if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
      toast.error('Please provide a valid start date.');
      return false;
    }

    if (start <= registration) {
      toast.error('Start date must be after the registration deadline.');
      return false;
    }

    if (end && (Number.isNaN(end.getTime()) || end <= start)) {
      toast.error('End date must be after the start date.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      toast.error('You must be logged in to create a tournament.');
      return;
    }

    if (!validateDates()) {
      return;
    }

    try {
      const createdTournament = await dispatch(createTournament(formData)).unwrap();
      toast.success('Tournament created successfully!');
      navigate(`/tournaments/${createdTournament.id}`);
    } catch {
      toast.error('Failed to create tournament. Please try again.');
    }
  };

  const previewDetails = useMemo(() => {
    const formatLabel =
      tournamentFormats.find((format) => format.value === formData.format)?.label || formData.format;

    return {
      formatLabel,
      dates: {
        registration: formData.registrationDeadline
          ? new Date(formData.registrationDeadline).toLocaleString()
          : 'TBD',
        start: formData.startDate ? new Date(formData.startDate).toLocaleString() : 'TBD',
        end: formData.endDate ? new Date(formData.endDate).toLocaleString() : 'TBD',
      },
    };
  }, [formData]);

  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-subtle backdrop-blur-xl">
        <div className="flex flex-col gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
            <Trophy className="h-4 w-4 text-brand-200" />
            New Tournament
          </span>
          <h1 className="text-3xl font-heading font-semibold text-white">Craft a new competitive experience</h1>
          <p className="max-w-2xl text-sm text-slate-300/80">
            Configure the perfect format, automate logistics, and give players everything they need to compete.
          </p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <form onSubmit={handleSubmit} className="space-y-10">
          <section className="card space-y-6 border-white/10 bg-indigo-950/80">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-200">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-heading font-semibold text-white">Tournament fundamentals</h2>
                <p className="text-xs text-slate-300/80">
                  Name your event and help players understand what to expect.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="input-label" htmlFor="name">
                  Tournament name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Summer Showdown 2024"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="input-label" htmlFor="game">
                  Game / Sport *
                </label>
                <input
                  id="game"
                  name="game"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Valorant, Chess, Rocket League..."
                  value={formData.game}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="input-label" htmlFor="description">
                Spotlight your competition
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="input-field"
                placeholder="Share the story, stakes, and vibe of this competition."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </section>

          <section className="card space-y-6 border-white/10 bg-indigo-950/80">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-200">
                <CalendarPlus className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-heading font-semibold text-white">Format & schedule</h2>
                <p className="text-xs text-slate-300/80">
                  Choose how players advance and set key moments for your tournament.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="input-label" htmlFor="format">
                  Format
                </label>
                <select
                  id="format"
                  name="format"
                  className="input-field"
                  value={formData.format}
                  onChange={handleInputChange}
                >
                  {tournamentFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400">
                  {
                    tournamentFormats.find((format) => format.value === formData.format)?.description ??
                    'Select the structure that fits your event best.'
                  }
                </p>
              </div>

              <div className="space-y-2">
                <label className="input-label" htmlFor="maxParticipants">
                  Max participants
                </label>
                <input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  min={2}
                  max={512}
                  className="input-field"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="input-label" htmlFor="registrationDeadline">
                  Registration closes
                </label>
                <input
                  id="registrationDeadline"
                  name="registrationDeadline"
                  type="datetime-local"
                  className="input-field"
                  value={formData.registrationDeadline}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="input-label" htmlFor="startDate">
                  Tournament starts
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  className="input-field"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="input-label" htmlFor="endDate">
                  Finals / end date
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  className="input-field"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </section>

          <section className="card space-y-6 border-white/10 bg-indigo-950/80">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-200">
                <Settings2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-heading font-semibold text-white">Player experience</h2>
                <p className="text-xs text-slate-300/80">
                  Fine-tune how players register, report scores, and view information.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  key: 'allowSelfRegistration',
                  label: 'Allow self-registration',
                  description: 'Players can join without manual approval.',
                },
                {
                  key: 'requireApproval',
                  label: 'Require organizer approval',
                  description: 'Review every participant before confirming their spot.',
                },
                {
                  key: 'showAsOfficial',
                  label: 'Highlight as official event',
                  description: 'Adds a verified badge across listings.',
                },
                {
                  key: 'hideForum',
                  label: 'Hide discussion forum',
                  description: 'Keep the focus on competition details only.',
                },
                {
                  key: 'allowParticipantScheduling',
                  label: 'Allow participants to coordinate matches',
                  description: 'Enable messaging and scheduling tools between players.',
                },
                {
                  key: 'showRounds',
                  label: 'Display round breakdowns',
                  description: 'Show upcoming matches and bracket progression.',
                },
                {
                  key: 'allowMatchReporting',
                  label: 'Allow players to report results',
                  description: 'Let trusted players submit scores for faster updates.',
                },
              ].map((setting) => (
                <label
                  key={setting.key}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 transition hover:border-white/20"
                >
                  <input
                    type="checkbox"
                    name={`settings.${setting.key}`}
                    checked={formData.settings[setting.key as keyof TournamentFormData['settings']]}
                    onChange={handleInputChange}
                    className="mt-1 h-5 w-5 rounded border-white/20 bg-white/10 text-brand-400 focus:ring-brand-400"
                  />
                  <span>
                    <span className="block font-medium text-white">{setting.label}</span>
                    <span className="text-xs text-slate-300/80">{setting.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="card space-y-6 border-white/10 bg-indigo-950/80">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-200">
                <Tags className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-heading font-semibold text-white">Rules & discoverability</h2>
                <p className="text-xs text-slate-300/80">
                  Help players find your event and stay aligned with expectations.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="input-label" htmlFor="rules">
                Rules & guidelines
              </label>
              <textarea
                id="rules"
                name="rules"
                rows={4}
                className="input-field"
                placeholder="Share formats, code of conduct, and required match reporting procedures."
                value={formData.rules}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-3">
              <label className="input-label" htmlFor="tags">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  id="tags"
                  type="text"
                  className="input-field"
                  placeholder="Add tags like fps, eu, lan..."
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                <button type="button" className="btn-secondary" onClick={handleAddTag}>
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="chip">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-xs text-slate-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="input-label" htmlFor="visibility">
                Visibility
              </label>
              <select
                id="visibility"
                name="visibility"
                className="input-field"
                value={formData.visibility}
                onChange={handleInputChange}
              >
                <option value="public">Public — discoverable to everyone</option>
                <option value="unlisted">Unlisted — visible with direct link</option>
                <option value="private">Private — invite only</option>
              </select>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-secondary justify-center sm:w-auto"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary justify-center sm:w-auto"
              disabled={loading}
            >
              {loading ? 'Launching...' : 'Create tournament'}
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="card space-y-4 border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-200">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-heading font-semibold text-white">Live preview</h3>
                <p className="text-xs text-slate-300/80">
                  A quick snapshot of how your event will look to players.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-indigo-950/70 p-5">
              <h4 className="text-xl font-heading font-semibold text-white">{formData.name || 'Untitled event'}</h4>
              <p className="text-sm text-brand-200">{formData.game || 'Game to be announced'}</p>
              <p className="mt-3 text-sm text-slate-300/80 line-clamp-4">
                {formData.description || 'Describe what makes this tournament exciting and why players should join.'}
              </p>
              <div className="mt-5 space-y-3 text-sm text-slate-200/80">
                <div className="flex justify-between">
                  <span>Format</span>
                  <span className="text-white">{previewDetails.formatLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max participants</span>
                  <span className="text-white">{formData.maxParticipants}</span>
                </div>
                <div className="flex justify-between">
                  <span>Registration</span>
                  <span className="text-white">{previewDetails.dates.registration}</span>
                </div>
                <div className="flex justify-between">
                  <span>Starts</span>
                  <span className="text-white">{previewDetails.dates.start}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card space-y-3 border-white/10 bg-white/5 text-sm text-slate-300/80">
            <h4 className="text-base font-heading font-semibold text-white">Organizer tips</h4>
            <ul className="space-y-2">
              <li>• Keep descriptions concise—players skim for essentials.</li>
              <li>• Tags improve discovery across your community.</li>
              <li>• Schedule buffer time between rounds to avoid delays.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CreateTournamentPage;
