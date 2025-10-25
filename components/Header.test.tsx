
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from './Header';

describe('Header', () => {
  it('should render the header with the correct text', () => {
    render(<Header />);
    expect(screen.getByText('ICPoker Trainer')).toBeInTheDocument();
  });
});
