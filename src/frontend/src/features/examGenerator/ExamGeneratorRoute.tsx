/**
 * Wrapper component for the Exam Generator page.
 * Allows it to be mounted in the new routing system without modification.
 */

import { ExamGeneratorPage } from './ExamGeneratorPage';

export function ExamGeneratorRoute() {
  return <ExamGeneratorPage />;
}
