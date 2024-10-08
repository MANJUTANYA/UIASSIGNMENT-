import React from 'react';
import App from './App';
import { render, screen } from '@testing-library/react'


test("App renders successfully", () => {
    //render component in virtual dom.
    render(<App/>);
  
    const element = screen.getByText(/Manju/i);
  
    expect(element).toHaveTextContent('Manju');
  })

  describe('calculateResults', () => {
    test.each`
      amount | expected
      ${120}  | ${90}
      
    `('returns $expected when amount=$120', ({ amount }) => {
      expect(calculate({ amount })).toEqual(expected);
    });
  });
