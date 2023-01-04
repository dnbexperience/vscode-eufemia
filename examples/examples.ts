import React from 'react'
import styled from '@emotion/styled'
import { calc } from '@dnb/eufemia/components/space/SpacingUtils'

const Component = styled.div`
  margin-top: 1rem;
  margin-bottom: 16px;
  margin-left: calc(var(--spacing-small) + 8rem);
  top: calc(var(--spacing-medium) + var(--spacing-small));
  padding-top: var(--spacing-x-small);

  margin-bottom: ${calc('small', 'large')};
  margin-bottom: ${calc('small large')};
`
