import { coachesApi } from '../../api/endpoints';
import { useApiAction } from '../../api/hooks';
import { Coach } from '../../types';

/**
 * Re-send the invite (a link to /set-password) to a coach who has not set a password yet.
 * Once the invite is accepted there is no admin-triggered password email.
 */
export function useCoachPasswordReset() {
  const { run, pending } = useApiAction();

  const sendLink = (coach: Coach) =>
    run(() => coachesApi.resendInvite(coach.id), {
      success: { title: 'Invite Sent Again', message: `A new set-password link was emailed to ${coach.email}.` },
      errorTitle: 'Could not resend invite',
      invalidate: [['coaches']],
    });

  const canSendLink = (coach: Coach) => coach.inviteStatus !== 'Accepted';

  return { sendLink, pending, canSendLink };
}
