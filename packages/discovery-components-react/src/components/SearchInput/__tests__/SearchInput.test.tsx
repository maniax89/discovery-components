import React from 'react';
import {
  render,
  fireEvent,
  getByPlaceholderText,
  getAllByLabelText,
  getByText,
  RenderResult,
  getByTestId,
  getAllByText,
  queryByTestId,
  waitForElementToBeRemoved
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContextIFC, SearchApiIFC } from '../../DiscoverySearch/DiscoverySearch';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchInput } from '../SearchInput';

const PLACE_HOLDER_TEXT = 'Type query term...';
const CLOSE_BUTTON_LABEL_TEXT = 'clear input label text';
const COMPLETIONS = ['some', 'someone', 'solar', 'somatic', 'soke'];
const SEARCHINPUTVALUE = 'so';
const expectNoCompletionsDropdown = (container: HTMLElement): void => {
  expect(queryByTestId(container, 'completions-dropdown-test-id')).toBeNull();
};

function findCompletionWrappers(
  completionsDropdown: HTMLElement,
  inputValue: string
): HTMLElement[] {
  return getAllByText(completionsDropdown, (_, element) => {
    const found =
      element &&
      typeof element.className === 'string' &&
      element.className.includes('__term') &&
      element.textContent &&
      element.textContent.includes(inputValue);
    return !!found;
  });
}

describe('<SearchInput />', () => {
  describe('When we type "so" into the SearchInput', () => {
    let input: HTMLInputElement;
    let container: HTMLElement;

    beforeEach(() => {
      const searchInput: RenderResult = render(
        <SearchInput
          placeHolderText={PLACE_HOLDER_TEXT}
          closeButtonLabelText={CLOSE_BUTTON_LABEL_TEXT}
          id="search-input-test-id"
        />
      );
      container = searchInput.container;
      input = getByPlaceholderText(container, PLACE_HOLDER_TEXT) as HTMLInputElement;
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: SEARCHINPUTVALUE } });
    });

    test('the input has value "so"', () => {
      expect(input.value).toBe(SEARCHINPUTVALUE);
    });

    describe('when we click the clear button', () => {
      let clearButton: HTMLButtonElement;

      beforeEach(() => {
        clearButton = getAllByLabelText(container, CLOSE_BUTTON_LABEL_TEXT)[0] as HTMLButtonElement;
        fireEvent.focus(clearButton);
        fireEvent.click(clearButton);
      });

      test('the input text is cleared', () => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('When spelling suggestions enabled', () => {
    const setSearchParametersMock = jest.fn();

    const api: Partial<SearchApiIFC> = {
      setSearchParameters: setSearchParametersMock
    };

    beforeEach(() => {
      render(
        wrapWithContext(
          <SearchInput placeHolderText={PLACE_HOLDER_TEXT} spellingSuggestions={true} />,
          api,
          {}
        )
      );
    });

    test('calls setSearchParameters with spelling suggestions enabled', () => {
      expect(setSearchParametersMock).toBeCalledWith(expect.any(Function));
      const returnFunc = setSearchParametersMock.mock.calls[1][0];
      const returnValue = returnFunc();
      expect(returnValue).toEqual(
        expect.objectContaining({
          spellingSuggestions: true
        })
      );
    });
  });

  describe('When we have completions', () => {
    let container: HTMLElement;
    let input: HTMLInputElement;

    const context: Partial<SearchContextIFC> = {
      autocompletionResults: {
        completions: COMPLETIONS
      }
    };

    describe('when we have component settings', () => {
      context.componentSettings = {
        autocomplete: false
      };
      describe('and there are no display parameters passed on SearchInput', () => {
        beforeEach(() => {
          const searchInput: RenderResult = render(
            wrapWithContext(<SearchInput placeHolderText={PLACE_HOLDER_TEXT} />, {}, context)
          );
          container = searchInput.container;
          input = getByPlaceholderText(container, PLACE_HOLDER_TEXT) as HTMLInputElement;
        });
        describe('when we type "so" into the input', () => {
          beforeEach(() => {
            fireEvent.focus(input);
            fireEvent.change(input, { target: { value: SEARCHINPUTVALUE } });
          });

          test('no autocompletions are displayed', () => {
            expectNoCompletionsDropdown(container);
          });
        });
      });
      describe('and there are some display parameters passed on SearchInput', () => {
        describe('when showAutocomplete is true', () => {
          beforeEach(() => {
            const searchInput: RenderResult = render(
              wrapWithContext(
                <SearchInput placeHolderText={PLACE_HOLDER_TEXT} showAutocomplete={true} />,
                {},
                context
              )
            );
            container = searchInput.container;
            input = getByPlaceholderText(container, PLACE_HOLDER_TEXT) as HTMLInputElement;
          });

          describe('when we type "so" into the input', () => {
            let completionsDropdown: HTMLElement;
            beforeEach(() => {
              fireEvent.focus(input);
              fireEvent.change(input, { target: { value: SEARCHINPUTVALUE } });
              completionsDropdown = getByTestId(container, 'completions-dropdown-test-id');
            });

            test('renders list of completions', () => {
              const completions = findCompletionWrappers(completionsDropdown, SEARCHINPUTVALUE);
              expect(completions.length).toBe(COMPLETIONS.length);
              COMPLETIONS.forEach(completion => {
                const suffix = completion.slice(SEARCHINPUTVALUE.length);
                expect(getByText(container, suffix)).toBeTruthy();
              });
            });
          });
        });

        describe('when showAutocomplete is false', () => {
          beforeEach(() => {
            const searchInput: RenderResult = render(
              wrapWithContext(
                <SearchInput placeHolderText={PLACE_HOLDER_TEXT} showAutocomplete={false} />,
                {},
                context
              )
            );
            container = searchInput.container;
            input = getByPlaceholderText(container, PLACE_HOLDER_TEXT) as HTMLInputElement;
          });

          describe('when we type "so" into the input', () => {
            beforeEach(() => {
              fireEvent.focus(input);
              fireEvent.change(input, { target: { value: SEARCHINPUTVALUE } });
            });

            test('no autocompletions are displayed', () => {
              expectNoCompletionsDropdown(container);
            });
          });
        });
      });
    });

    describe('when showAutocomplete is true', () => {
      beforeEach(() => {
        const searchInput: RenderResult = render(
          wrapWithContext(
            <SearchInput placeHolderText={PLACE_HOLDER_TEXT} showAutocomplete={true} />,
            {},
            context
          )
        );
        container = searchInput.container;
        input = getByPlaceholderText(container, PLACE_HOLDER_TEXT) as HTMLInputElement;
      });

      describe('when we type "som" into the input', () => {
        let completionsDropdown: HTMLElement;
        beforeEach(() => {
          fireEvent.focus(input);
          fireEvent.change(input, { target: { value: 'som' } });
          completionsDropdown = getByTestId(container, 'completions-dropdown-test-id');
        });

        test('limits the list of completions', () => {
          const completions = findCompletionWrappers(completionsDropdown, 'som');
          expect(completions.length).toBe(3);
        });
      });

      describe('when we type "so" into the input', () => {
        let completionsDropdown: HTMLElement;
        beforeEach(() => {
          fireEvent.focus(input);
          fireEvent.change(input, { target: { value: SEARCHINPUTVALUE } });
          completionsDropdown = getByTestId(container, 'completions-dropdown-test-id');
        });

        test('renders list of completions', () => {
          const completions = findCompletionWrappers(completionsDropdown, SEARCHINPUTVALUE);
          expect(completions.length).toBe(COMPLETIONS.length);
          COMPLETIONS.forEach(completion => {
            const suffix = completion.slice(2); // everything after 'so'
            expect(getByText(container, suffix)).toBeTruthy();
          });
        });

        describe('when we focus on one of the completions', () => {
          beforeEach(() => {
            fireEvent.focus(getByText(container, COMPLETIONS[1].slice(2)));
          });

          describe('when we hit the Enter key', () => {
            beforeEach(() => {
              fireEvent.keyUp(getByText(container, COMPLETIONS[1].slice(2)), {
                key: 'Enter',
                code: 13
              });
            });

            test('the search input is updated with the completion, and a space is added', () => {
              expect(input.value).toBe(`${COMPLETIONS[1]} `);
            });
          });
        });

        describe('when a completion is clicked', () => {
          beforeEach(() => {
            const lastCompletion = getByText(container, COMPLETIONS[4].slice(2));
            fireEvent.focus(lastCompletion); //happens during a click, but not during fireEvent.click
            fireEvent.click(lastCompletion);
          });

          test('the input value is updated, and a space is added', () => {
            expect(input.value).toBe(`${COMPLETIONS[4]} `);
          });
        });

        describe('when the SearchInput is no longer focused', () => {
          beforeEach(() => {
            fireEvent.blur(getByTestId(container, 'search-input-test-id'));
          });

          test('the completions dropdown disappears', () => {
            waitForElementToBeRemoved(() =>
              queryByTestId(container, 'completions-dropdown-test-id')
            ).then(() => {
              expectNoCompletionsDropdown(container);
            });
          });
        });
      });

      describe('When we type "this is so" into the Search input', () => {
        let completionsDropdown: HTMLElement;
        beforeEach(() => {
          fireEvent.focus(input);
          fireEvent.change(input, { target: { value: 'this is so' } });
          completionsDropdown = getByTestId(container, 'completions-dropdown-test-id');
        });

        test('the completions all start with "this is so"', () => {
          const completions = findCompletionWrappers(completionsDropdown, 'this is so');
          expect(completions.length).toBe(COMPLETIONS.length);
        });

        test('the completions end with the correct suggestions', () => {
          COMPLETIONS.forEach(completion => {
            const completions = findCompletionWrappers(completionsDropdown, completion);
            expect(completions.length).toBeGreaterThanOrEqual(1);
          });
        });
      });
    });

    describe('when showAutocomplete is false', () => {
      beforeEach(() => {
        const searchInput: RenderResult = render(
          wrapWithContext(
            <SearchInput placeHolderText={PLACE_HOLDER_TEXT} showAutocomplete={false} />,
            {},
            context
          )
        );
        container = searchInput.container;
        input = getByPlaceholderText(container, PLACE_HOLDER_TEXT) as HTMLInputElement;
      });

      describe('when we type "so" into the input', () => {
        beforeEach(() => {
          fireEvent.focus(input);
          fireEvent.change(input, { target: { value: SEARCHINPUTVALUE } });
        });

        test('no autocompletions are displayed', () => {
          expectNoCompletionsDropdown(container);
        });
      });
    });
  });
});
