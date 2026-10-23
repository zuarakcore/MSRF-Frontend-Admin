import { coachesApi } from '../../api/endpoints';
import { useApiAction } from '../../api/hooks';
import { Coach } from '../../types';

/**
 * Re-send the invite email with the coach's sign-in details. The backend re-sends the current
 * password, or issues one for coaches added before passwords were stored.
 */
export function useCoachPasswordReset() {
  const { run, pending } = useApiAction();

  const sendLink = (coach: Coach) =>
    run(() => coachesApi.resendInvite(coach.id), {
      success: { title: 'Invite Sent Again', message: `Sign-in details were emailed to ${coach.email}.` },
      errorTitle: 'Could not resend invite',
      invalidate: [['coaches']],
    });

  // Offered until the coach has signed up, and for any coach whose password isn't visible yet.
  const canSendLink = (coach: Coach) => coach.inviteStatus !== 'Accepted' || !coach.tempPassword;

  return { sendLink, pending, canSendLink };
}
